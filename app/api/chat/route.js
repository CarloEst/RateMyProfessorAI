import { NextResponse } from 'next/server'
import { Pinecone } from '@pinecone-database/pinecone'
import OpenAI from 'openai'

const systemPrompt = 
`
You are a knowledgeable assistant for a service similar to RateMyProfessor. Your goal is to help students find the best professors for their needs. Given a student's query, you will search through a database of professor reviews and provide the top 3 professors who best match the student's criteria. Your responses should be clear, concise, and helpful. Include the professor's name, their subject, the average star rating, and a brief summary of the reviews. If the query is ambiguous or too broad, ask the student for more specific details to narrow down the search.

Example Query:
"Who are the best computer science professors for AI courses?"

Example Response:

Professor Jane Smith - Artificial Intelligence
Rating: 4.8/5
Summary: Students praise Professor Smith for her deep knowledge of AI and engaging lectures. She is approachable and offers great feedback on assignments.

Professor John Doe - Machine Learning
Rating: 4.7/5
Summary: Professor Doe is highly regarded for his practical approach to teaching machine learning. His classes are challenging but rewarding, with a strong focus on real-world applications.

Professor Emily Davis - Neural Networks
Rating: 4.6/5
Summary: Known for her expertise in neural networks, Professor Davis provides comprehensive lectures and is very supportive during office hours. Students appreciate her clear explanations and detailed coursework.

When a student asks a question, use the RAG system to retrieve relevant information and respond with the top 3 professors that best match the query. Always strive to provide accurate and relevant recommendations.
`

export async function POST(req) {
    const data = await req.json()
    

    const pc = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
      })
    const index = pc.index('rag').namespace('ns1')
    const openai = new OpenAI()

    const text = data[data.length - 1].content
    const embedding = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
        encoding_format: 'float',
    })

    const results = await index.query({
        topK: 3,
        includeMetadata: true,
        vector: embedding.data[0].embedding,
    })

    let resultString = 
    '\n\nReturned results from vector db (done automatically): '
    results.matches.forEach((match) => {
        resultString += `\n
        Professor: ${match.id}
        Review: ${match.metadata.stars}
        Subject: ${match.metadata.subject}
        Stars: ${match.metadata.stars}
        \n\n`
    })

    const lastMessage = data[data.length - 1]
    const lastMessageContent = lastMessage.content + resultString
    const lastDataWithoutLastMessage = data.slice(0, data.length - 1)
    const completion = await openai.chat.completions.create({
        messages: [
          {role: 'system', content: systemPrompt},
          ...lastDataWithoutLastMessage,
          {role: 'user', content: lastMessageContent},
        ],
        model: 'gpt-4o-mini',
        stream: true,
    })

    const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder()
          try {
            for await (const chunk of completion) {
              const content = chunk.choices[0]?.delta?.content
              if (content) {
                const text = encoder.encode(content)
                controller.enqueue(text)
              }
            }
          } catch (err) {
            controller.error(err)
          } finally {
            controller.close()
          }
        },
    })
    return new NextResponse(stream)
}