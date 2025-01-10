import React, { useEffect, useState, useRef } from "react"
import axios from 'axios'
import Cookies from 'js-cookie'
import { useNavigate } from 'react-router-dom'

function Chat() {
  const [chats, setChats] = useState([])
  const [chat, setChat] = useState({})
  const navigate = useNavigate();
  const clientId = process.env.REACT_APP_CLIENT_ID;
  const clientSecret = process.env.REACT_APP_CLIENT_SECRET;
  const username = localStorage.getItem('username')
  const [newMessage, setNewMessage] = useState('');
  const [key, setKey] = useState(0)

  const fetchChats = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const csrfToken = Cookies.get('csrftoken');

      if (!accessToken) {
        console.error('No access token found');
        navigate('/login');
        return;
      }

      const response = await axios.get("http://localhost:8000/my_conversations/", {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken // Include CSRF token in headers
        }
      });
      console.log("Chats : ", response.data);
      setChats(response.data);
      
      // Check if the current chat is still in the fetched chats
      const currentChat = response.data.find(c => c.id === chat.id);
      if (currentChat) {
        setChat(currentChat); // Update the current chat with the latest messages
        await markMessagesAsRead(currentChat.messages); // Mark messages as read
      } else {
        setChat({}); // Optionally reset if the current chat is not found
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      if (error.response && error.response.status === 401) {
        const refreshToken = localStorage.getItem('refreshToken'); // Ensure this is defined again
        const csrfToken = Cookies.get('csrftoken'); // Ensure this is defined again
        if (refreshToken) {
          try {
            const refreshResponse = await axios.post(
              'http://localhost:8000/o/token/',
              new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                client_id: clientId, // Replace with your actual client ID
                client_secret: clientSecret, // Replace with your actual client secret
              }),
              {
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                  'X-CSRFToken': csrfToken, // Optional, only include if needed
                },
              }
            );

            const newAccessToken = refreshResponse.data.access_token;
            localStorage.setItem('accessToken', newAccessToken);

            // Retry fetching chats with the new token
            fetchChats();
          } catch (refreshError) {
            console.error('Error refreshing token:', refreshError);
            navigate('/login');
          }
        } else {
          navigate('/');
        }
      }
    }
  };

  // New function to mark messages as read
  const markMessagesAsRead = async (messages) => {
    const accessToken = localStorage.getItem('accessToken');
    const csrfToken = Cookies.get('csrftoken');

    const unreadMessages = messages.filter(message => message.sent_by_username !== username);

    if (unreadMessages.length > 0) {
      try {
        await Promise.all(unreadMessages.map(message => 
          axios.patch(`http://localhost:8000/messages/${message.id}/`, { is_read: true }, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              'X-CSRFToken': csrfToken,
            },
          })
        ));
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    }
  };

  useEffect(() => {
    fetchChats(); // Initial fetch of chats

    const interval = setInterval(() => {
      fetchChats(); // Fetch chats periodically
    }, 5000); 

    return () => clearInterval(interval); // Clear interval on component unmount
  }, [navigate, clientId, clientSecret, key, chat.id]); // Include chat.id in dependencies

  // Function to handle message submission
  const handleSendMessage = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    if (!newMessage.trim()) return; // Don't send empty messages

    try {
      const accessToken = localStorage.getItem('accessToken');
      const csrfToken = Cookies.get('csrftoken');

      const response = await axios.post("http://localhost:8000/send_message/", {
        chat: chat.id,
        message: newMessage,
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
      });
      console.log("Response after sending message : ", response)
      setNewMessage('');
      setKey(key+1)
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Inside the Chat component
  const messageEndRef = useRef(null);

  // Function to scroll to the bottom
  const scrollToBottom = () => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom(); // Call this whenever `chat.messages` changes
  }, [chat.messages]);

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h2 style={styles.sidebarTitle}>Conversations</h2>
        </div>
        <div style={styles.chatList}>
          {chats.map((chatItem) => (
            <div 
              key={chatItem.id} 
              onClick={() => setChat(chatItem)} 
              style={{
                ...styles.chatItem,
                backgroundColor: chat.id === chatItem.id ? '#edf2f7' : 'transparent'
              }}
            >
              <div style={styles.chatItemContent}>
                <h3 style={styles.chatItemTitle}>{chatItem.subject}</h3>
                <span style={styles.chatItemDate}>
                  {new Date(chatItem.date_updated).toLocaleDateString()}
                </span>
              </div>
              {chatItem.unread_messages > 0 && (
                <div style={styles.unreadBadge}>
                  {chatItem.unread_messages}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={styles.chatArea}>
        {Object.keys(chat).length > 0 ? (
          <>
            <div style={styles.chatHeader}>
              <h2 style={styles.chatTitle}>{chat.subject}</h2>
            </div>

            <div style={styles.messagesContainer}>
              {chat.messages
                .sort((a, b) => new Date(a.date_created) - new Date(b.date_created))
                .map((message) => (
                  <div 
                    key={message.id} 
                    style={{
                      ...styles.messageWrapper,
                      justifyContent: message.sent_by_username === username ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <div style={{
                      ...styles.message,
                      ...(message.sent_by_username === username ? styles.sentMessage : styles.receivedMessage)
                    }}>
                      <div style={styles.messageContent}>
                        {message.message}
                      </div>
                      <div style={styles.messageTime}>
                        {new Date(message.date_created).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              <div ref={messageEndRef} />
            </div>

            <form onSubmit={handleSendMessage} style={styles.messageForm}>
              <input 
                type="text" 
                value={newMessage} 
                onChange={(e) => setNewMessage(e.target.value)} 
                placeholder="Type your message..." 
                style={styles.messageInput}
              />
              <button type="submit" style={styles.sendButton}>
                Send
              </button>
            </form>
          </>
        ) : (
          <div style={styles.emptyChatState}>
            <h2>Select a conversation to start chatting</h2>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    height: 'calc(100vh - 64px)',
    backgroundColor: '#f7fafc',
  },
  sidebar: {
    width: '320px',
    borderRight: '1px solid #e2e8f0',
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'column',
  },
  sidebarHeader: {
    padding: '20px',
    borderBottom: '1px solid #e2e8f0',
  },
  sidebarTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '600',
    color: '#2d3748',
  },
  chatList: {
    flex: 1,
    overflowY: 'auto',
  },
  chatItem: {
    padding: '16px 20px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    '&:hover': {
      backgroundColor: '#f7fafc',
    },
  },
  chatItemContent: {
    flex: 1,
  },
  chatItemTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '500',
    color: '#2d3748',
    marginBottom: '4px',
  },
  chatItemDate: {
    fontSize: '12px',
    color: '#718096',
  },
  unreadBadge: {
    backgroundColor: '#4299e1',
    color: 'white',
    borderRadius: '12px',
    padding: '2px 8px',
    fontSize: '12px',
    fontWeight: '500',
  },
  chatArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  chatHeader: {
    padding: '20px',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: 'white',
  },
  chatTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '600',
    color: '#2d3748',
  },
  messagesContainer: {
    flex: 1,
    padding: '20px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  messageWrapper: {
    display: 'flex',
    width: '100%',
  },
  message: {
    maxWidth: '70%',
    padding: '12px 16px',
    borderRadius: '12px',
    position: 'relative',
  },
  sentMessage: {
    backgroundColor: '#4299e1',
    color: 'white',
    borderBottomRightRadius: '4px',
  },
  receivedMessage: {
    backgroundColor: 'white',
    color: '#2d3748',
    borderBottomLeftRadius: '4px',
  },
  messageContent: {
    fontSize: '14px',
    lineHeight: '1.5',
  },
  messageTime: {
    fontSize: '11px',
    opacity: 0.8,
    marginTop: '4px',
  },
  messageForm: {
    padding: '20px',
    backgroundColor: 'white',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    gap: '12px',
  },
  messageInput: {
    flex: 1,
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    '&:focus': {
      outline: 'none',
      borderColor: '#4299e1',
    },
  },
  sendButton: {
    backgroundColor: '#4299e1',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '0 24px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: '#3182ce',
    },
  },
  emptyChatState: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#718096',
  },
}

export default Chat