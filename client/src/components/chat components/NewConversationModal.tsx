import { ChatContext } from '../../contexts/chat.context';
import { useContext } from 'react';

export default function NewConversationModal() {
    return (
            <div className="h-56 w-full bg-black">
                <button> send message </button>
                <button> cancel </button>
            </div>
    )
}