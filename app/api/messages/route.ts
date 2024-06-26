import { getCurrentUser } from '@/app/actions/getUser';
import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prismadb';
import { pusherServer } from '@/app/lib/pusher';

export async function POST(request: Request) {
    try {
        const currentUser = await getCurrentUser();
        const body = await request.json();

        const { message, image, conversationId } = body;

        if (!currentUser?.id || !currentUser?.email) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const newMessage = await prisma.message.create({
            data: {
                body: message,
                image: image,
                conversation: {
                    connect: {
                        id: conversationId,
                    },
                },
                sender: {
                    connect: {
                        id: currentUser.id,
                    },
                },
                seen: {
                    connect: {
                        id: currentUser.id,
                    },
                },
            },
            include: {
                seen: true,
                sender: true,
            },
        });

        const updatedConversation = await prisma.conversation.update({
            where: {
                id: conversationId,
            },
            data: {
                lastMesasgeAt: new Date(),
                messages: {
                    connect: {
                        id: newMessage.id,
                    },
                },
            },
            include: {
                members: true,
                messages: {
                    include: {
                        seen: true,
                    },
                },
            },
        });

        await pusherServer.trigger(conversationId!, 'messages:new', newMessage);
        const lastMesasge =
            updatedConversation.messages[
                updatedConversation.messages.length - 1
            ];
        updatedConversation.members.map((member) => {
            if (member.email) {
                pusherServer.trigger(member.email, 'conversation:update', {
                    id: conversationId,
                    messages: [lastMesasge],
                });
            }
        });

        return NextResponse.json(newMessage);
    } catch (error) {
        console.log(error, 'ERROR_MESSAGES');
        return new NextResponse('InternalError', { status: 500 });
    }
}
