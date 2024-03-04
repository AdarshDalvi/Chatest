'use client';

import { FullConversationType } from '@/app/types/conversation';
import { useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import Avatar from '@/app/(home)/components/Avatar';
import clsx from 'clsx';
import { FaImage } from 'react-icons/fa6';
import { format } from 'date-fns';
import capitalizeString from '@/app/lib/capitaliseString';
import useMobileView from '@/app/hooks/useMobileView';
import CardWrapper from '../components/WrapperComponents/CardWrapper/CardWrapper';
import useConversation from '@/app/hooks/useConversation';

interface ConversationCardProps {
    chat: FullConversationType;
    selected?: boolean;
    lastElement: boolean;
}

const ConversationCard: React.FC<ConversationCardProps> = ({
    chat,
    selected,
    lastElement,
}) => {
    const session = useSession();
    const { mobileView } = useMobileView(500);
    const { updateConversationId } = useConversation();

    const handleClick = useCallback(() => {
        updateConversationId(chat.id);
    }, [chat.id]);

    const lastMessage = useMemo(() => {
        const messages = chat.messages || [];
        const lastMessage = messages[messages.length - 1];
        return lastMessage;
    }, [chat.messages]);

    const currentUserEmail = useMemo(() => {
        return session.data?.user.email;
    }, [session.data?.user.email]);

    const unseenMessages = useMemo(() => {
        if (!currentUserEmail || chat.messages.length < 1) return [];

        const unseenMesages = chat.messages.filter((message) => {
            const isMessageSeen = message.seen.some(
                (seenUser) => seenUser.email === currentUserEmail
            );
            return !isMessageSeen;
        });

        return unseenMesages;
    }, [currentUserEmail, chat.messages]);

    const lastMessageText: React.ReactNode = useMemo(() => {
        if (!currentUserEmail) {
            return; // Or any placeholder text while data is loading
        }
        if (!lastMessage) {
            if (chat.isGroup) {
                const groupCreatedBy = chat.users.find(
                    (user) => user.id === chat.groupCreatedById
                );

                const isCurrentUserGroupCreator =
                    groupCreatedBy!.email === currentUserEmail;
                return (
                    <div className="flex w-full gap-1.5">
                        {isCurrentUserGroupCreator ? (
                            <>
                                <p>You created the group</p>
                                <p className="flex-1 truncate">{`"${chat.name}"`}</p>
                            </>
                        ) : (
                            <>
                                <p
                                    className="truncate"
                                    style={{
                                        maxWidth: mobileView
                                            ? 'calc(100% - 120px)'
                                            : 'calc(100% - 132px)',
                                    }}
                                >
                                    {`${capitalizeString(
                                        groupCreatedBy!.name!
                                    )}`}
                                </p>
                                <p>added you to the group</p>
                            </>
                        )}
                    </div>
                );
            } else {
                return <p>Started a conversation</p>;
            }
        } else {
            const senderDisplayName =
                lastMessage.sender.email === currentUserEmail
                    ? 'You'
                    : lastMessage.sender.name;

            if (lastMessage?.image) {
                const imageCaption = lastMessage.image?.caption || 'Photo';
                return (
                    <div className="flex items-center">
                        {chat.isGroup && <p>{senderDisplayName}</p>}
                        <FaImage size={mobileView ? 12 : 14} />
                        <p className="ml-2">{imageCaption}</p>
                    </div>
                );
            } else if (lastMessage?.body) {
                return <p className="w-full truncate">{lastMessage.body}</p>;
            }
        }
    }, [lastMessage, currentUserEmail]);

    const chatCardImg = chat.image;

    return (
        <CardWrapper
            handleClick={handleClick}
            selected={selected}
            lastElement={lastElement}
        >
            <div className="py-6">
                <Avatar
                    avatarImg={chatCardImg}
                    status={true}
                    size="CARD"
                    isGroup={chat.isGroup}
                />
            </div>
            <div className="flex-1 self-stretch  items-start justify-center flex flex-col min-w-0 gap-1 pr-6 border-t-[0.667px] border-cardBorder hover:border-none text-xl midPhones:text-2xl">
                <div className="flex w-full justify-between">
                    <p>{chat.name}</p>
                    {lastMessage?.createdAt && (
                        <p className="text-lg text-gray-400">
                            {format(lastMessage.createdAt, 'p')}
                        </p>
                    )}
                </div>
                <div className="flex w-full min-h-6 gap-4">
                    <div
                        className={clsx(
                            'flex-1 text-start min-w-0 text-lg midPhones:text-xl',
                            unseenMessages.length > 0
                                ? 'text-white'
                                : 'text-gray-400'
                        )}
                    >
                        {lastMessageText}
                    </div>
                    {unseenMessages.length > 0 && (
                        <div
                            className={clsx(
                                'bg-primary rounded-full text-base midPhones:text-lg',
                                unseenMessages.length <= 9
                                    ? 'px-2.5 py-px midPhones:px-[6.7px] midPhones:py-0.5'
                                    : 'px-2 py-[3px] midPhones:px-[5.3px]',
                                unseenMessages.length > 99 &&
                                    'px-[5px] py-[5.4px]'
                            )}
                        >
                            {unseenMessages.length > 99
                                ? '99+'
                                : unseenMessages.length}
                        </div>
                    )}
                </div>
            </div>
            {/* <div className="flex-1 self-stretch items-start min-w-0 flex flex-col justify-center gap-1 pr-6 border-t-[0.667px] border-cardBorder hover:border-none text-xl midPhones:text-2xl">
                <div className="flex justify-between">
                    <p>{chat.name}</p>
                    {lastMessage?.createdAt && (
                        <p className="text-lg text-gray-400">
                            {format(lastMessage.createdAt, 'p')}
                        </p>
                    )}
                </div>
                <div className="flex self-start  justify-between min-h-6 gap-4 w-full items-center">
                    <div
                        className={clsx(
                            'flex-1 min-w-0 text-lg midPhones:text-xl',
                            unseenMessages.length > 0
                                ? 'text-white'
                                : 'text-gray-400'
                        )}
                    >
                        {lastMessageText}
                    </div>
                    {unseenMessages.length > 0 && (
                        <div
                            className={clsx(
                                'bg-primary rounded-full text-base midPhones:text-lg',
                                unseenMessages.length <= 9
                                    ? 'px-2.5 py-px midPhones:px-[6.7px] midPhones:py-0.5'
                                    : 'px-2 py-[3px] midPhones:px-[5.3px]',
                                unseenMessages.length > 99 &&
                                    'px-[5px] py-[5.4px]'
                            )}
                        >
                            {unseenMessages.length > 99
                                ? '99+'
                                : unseenMessages.length}
                        </div>
                    )}
                </div>
            </div> */}
        </CardWrapper>
    );
};

export default ConversationCard;
