'use client';

import React, { useEffect, useState } from 'react';
import useConversation from '@/app/hooks/useConversation';
import { FullConversationType } from '@/app/types/conversation';
import ConversationScreenHeader from './components/Header';
import ConversationScreenBody from './components/Body';
import Form from './components/Form';

type ConversationDetailsProps = {
    initialConversations: FullConversationType[];
};

const ConversationDetails: React.FC<ConversationDetailsProps> = ({
    initialConversations,
}) => {
    const { conversationId } = useConversation();

    const [conversation, setConversation] = useState<
        FullConversationType | undefined
    >();
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        setLoading(true);
        const foundConversation = initialConversations.find(
            (initialConversation) => initialConversation.id === conversationId
        );
        if (foundConversation) {
            setConversation(foundConversation);
        }
        setLoading(false);
    }, [conversationId, initialConversations]); // Added initialConversations to the dependency array

    if (!conversationId) {
        return null;
    }

    if (loading && !conversation) {
        return <p>Loading...</p>;
    }

    if (!conversation) {
        return <p>No conversation found!</p>;
    }

    return (
        <main className="flex-1 flex flex-col h-dvh min-w-[250px] bg-secondary relative">
            <div className="bg-chatBody bg-fixed h-full w-full opacity-5 absolute left-0 top-0 z-0"></div>
            <ConversationScreenHeader conversation={conversation} />
            <ConversationScreenBody
                initialMessages={conversation.messages}
                isGroup={conversation.isGroup}
            />
            <Form conversationId={conversationId} />
        </main>
    );
};

export default ConversationDetails;
