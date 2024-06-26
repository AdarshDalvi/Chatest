import getConversations from '../actions/getConversations';
import { getCurrentUser } from '../actions/getUser';
import getUsers from '../actions/getUsers';
import EmptyState from './components/EmptyState';
import Header from './components/Header';
import PageWrapper, {
    WrapperProps,
} from './components/WrapperComponents/PageWrapper';

const ChatLayout: React.FC<WrapperProps> = async ({ children }) => {
    const currentUser = await getCurrentUser();
    const conversations = await getConversations();
    const users = await getUsers();

    return (
        <main className="flex relative w-full h-full max-w-[1600px] text-white">
            <PageWrapper>
                <Header
                    initialCurrentUser={currentUser!}
                    users={users}
                    conversations={conversations}
                />
            </PageWrapper>
            <EmptyState />
            {children}
        </main>
    );
};

export default ChatLayout;
