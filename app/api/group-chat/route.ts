import prisma from '@/app/lib/prismadb';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/actions/getUser';

export async function POST(request: Request) {
    try {
        const currentUser = await getCurrentUser();
        const body = await request.json();
        const { name, image, members, groupDescription } = body;
        console.log(members);

        if (!currentUser?.id || !currentUser.email) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const newGroupConversation = await prisma.conversation.create({
            data: {
                name,
                isGroup: true,
                image: image,
                members: {
                    connect: [
                        ...members.map((member: { id: string }) => ({
                            id: member.id,
                        })),
                        {
                            id: currentUser.id,
                        },
                    ],
                },
                groupDescription,
                admins: {
                    connect: [
                        {
                            id: currentUser.id,
                        },
                    ],
                },
                groupCreatedById: currentUser.id,
            },
            include: {
                members: true,
                admins: true,
            },
        });
        return NextResponse.json(newGroupConversation, { status: 200 });
    } catch (error: any) {
        console.log(error, 'ERROR_MESSAGES_GROUP_CHAT');
        return new NextResponse(`Internal Error ${error}`, { status: 500 });
    }
}
