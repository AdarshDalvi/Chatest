import { getCurrentUser } from '@/app/actions/getUser';
import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prismadb';
import { pusherServer } from '@/app/lib/pusher';

interface IParamas {
    conversationId: string;
}

export async function PATCH(
    request: Request,
    { params }: { params: IParamas }
) {
    try {
        const { conversationId } = params;
        const currentUser = await getCurrentUser();
        const body = await request.json();
        const { memberId, action } = body;

        if (!currentUser || !currentUser.id || !currentUser.email) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        let admins: any = {};

        if (action === 'connect') {
            admins = {
                connect: {
                    id: memberId,
                },
            };
        } else if (action === 'disconnect') {
            admins = {
                disconnect: {
                    id: memberId,
                },
            };
        } else {
            // Handle invalid action
            return new NextResponse('Invalid action', { status: 400 });
        }

        const updatedConversation = await prisma.conversation.update({
            where: {
                id: conversationId,
            },
            data: {
                admins: admins,
            },
            include: {
                admins: true,
            },
        });

        await pusherServer.trigger(conversationId, 'conversation:admins', {
            id: conversationId,
            adminsIds: updatedConversation.adminsIds,
        });

        return NextResponse.json(updatedConversation);
    } catch (error: any) {
        console.log('ERROR IN GROUP_CHAT_ADMIN', error);
        return new NextResponse(`Internal Error`, { status: 500 });
    }
}
