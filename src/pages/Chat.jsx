import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

function Chat() {
  const [chats, setChats] = useState([]);
  const [chat, setChat] = useState({});
  const [newMessage, setNewMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showGroupChatModal, setShowGroupChatModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newChatSubject, setNewChatSubject] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const navigate = useNavigate();
  const clientId = process.env.REACT_APP_CLIENT_ID;
  const clientSecret = process.env.REACT_APP_CLIENT_SECRET;
  const username = localStorage.getItem("username");
  const userId = localStorage.getItem("userId");

  // WebSocket reference to keep it stable across renders
  const socketRef = useRef(null);
  // Message end reference for scrolling
  const messageEndRef = useRef(null);

  // Function to get auth headers
  const getAuthHeaders = useCallback(() => {
    const accessToken = localStorage.getItem("accessToken");
    const csrfToken = Cookies.get("csrftoken");

    return {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    };
  }, []);

  // Function to refresh token
  const refreshToken = useCallback(async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    const csrfToken = Cookies.get("csrftoken");

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/o/token/",
        new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
          client_id: clientId,
          client_secret: clientSecret,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "X-CSRFToken": csrfToken,
          },
        }
      );

      const newAccessToken = response.data.access_token;
      localStorage.setItem("accessToken", newAccessToken);
      return newAccessToken;
    } catch (error) {
      console.error("Error refreshing token:", error);
      throw error;
    }
  }, [clientId, clientSecret]);

  // Function to handle API requests with token refresh
  const apiRequest = useCallback(async (method, url, data = null) => {
    try {
      const headers = getAuthHeaders();
      const config = { headers };

      let response;
      if (method.toLowerCase() === 'get') {
        response = await axios.get(url, config);
      } else if (method.toLowerCase() === 'post') {
        response = await axios.post(url, data, config);
      } else if (method.toLowerCase() === 'patch') {
        response = await axios.patch(url, data, config);
      }

      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        try {
          await refreshToken();
          // Retry the request with new token
          return apiRequest(method, url, data);
        } catch (refreshError) {
          setErrorMessage("Session expired. Please login again.");
          navigate("/login");
          throw refreshError;
        }
      }
      throw error;
    }
  }, [getAuthHeaders, refreshToken, navigate]);

  // Function to search for users
  const searchUsers = useCallback(async (query) => {
    if (!query || query.length < 3) return;

    try {
      const results = await apiRequest('get', `http://localhost:8000/search_users/?query=${query}`);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching users:", error);
      setErrorMessage("Failed to search for users.");
    }
  }, [apiRequest]);

  // Function to create a new conversation
  const createNewConversation = useCallback(async () => {
    if (!selectedUser || !newChatSubject) return;

    try {
      const response = await apiRequest(
        'post',
        "http://localhost:8000/create_conversation/",
        {
          subject: newChatSubject,
          participants: [selectedUser.id, userId]
        }
      );

      // Reset form and close modal
      setNewChatSubject("");
      setSelectedUser(null);
      setSearchQuery("");
      setSearchResults([]);
      setShowNewChatModal(false);

      // Set the newly created chat as the active chat
      setChat(response);

      // The WebSocket will handle updating the chat list
    } catch (error) {
      console.error("Error creating conversation:", error);
      setErrorMessage("Failed to create new conversation.");
    }
  }, [selectedUser, newChatSubject, userId, apiRequest]);

  // Function to create a new conversation
  const createNewGroupConversation = useCallback(async () => {
    if (!selectedUsers || !newChatSubject) return;

    try {
      const response = await apiRequest(
        'post',
        "http://localhost:8000/create_conversation/",
        {
          subject: newChatSubject,
          participants: [...selectedUsers.map(u => u.id), userId],
          is_group: true
        }
      );

      // Reset form and close modal
      setNewChatSubject("");
      setSelectedUser(null);
      setSearchQuery("");
      setSearchResults([]);
      setShowGroupChatModal(false);

      // Set the newly created chat as the active chat
      setChat(response);


      // The WebSocket will handle updating the chat list
    } catch (error) {
      console.error("Error creating conversation:", error);
      setErrorMessage("Failed to create new conversation.");
    }
  }, [selectedUser, newChatSubject, userId, apiRequest]);

  // Function for marking messages as read
  const markMessagesAsRead = useCallback(async (messages) => {
    if (!messages || !messages.length) return;

    const unreadMessages = messages.filter(
      (message) => message.sent_by_username !== username && !message.is_read
    );

    if (unreadMessages.length > 0) {
      try {
        await Promise.all(
          unreadMessages.map((message) =>
            apiRequest('patch', `http://localhost:8000/messages/${message.id}/`, { is_read: true })
          )
        );
      } catch (error) {
        console.error("Error marking messages as read:", error);
        setErrorMessage("Failed to update message status.");
      }
    }
  }, [username, apiRequest]);

  // Function to fetch chats
  const fetchChats = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest('get', "http://localhost:8000/my_conversations/");
      setChats(response);

      // If we have a current chat, update it with fresh data
      if (chat.id) {
        const currentChat = response.find((c) => c.id === chat.id);
        if (currentChat) {
          setChat(currentChat);
          await markMessagesAsRead(currentChat.messages);
        }
      } else if (response.length > 0) {
        // If no chat is selected and we have chats, select the first one
        setChat(response[0]);
        await markMessagesAsRead(response[0].messages);
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching chats:", error);
      setErrorMessage("An error occurred while fetching chats.");
      setIsLoading(false);
    }
  }, [chat.id, apiRequest, markMessagesAsRead]);

  // Function to handle message submission
  // Modify the handleSendMessage function to update the UI immediately
  const handleSendMessage = useCallback(async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !chat.id) return;

    try {
      // Create a temporary message object to show immediately
      const tempMessage = {
        id: `temp-${Date.now()}`, // Temporary ID
        message: newMessage,
        sent_by_username: username,
        date_created: new Date().toISOString(),
        is_read: false,
        chat: chat.id
      };

      // Update the UI immediately with the temporary message
      setChat(prevChat => ({
        ...prevChat,
        messages: [...prevChat.messages, tempMessage]
      }));

      // Also update in the chats list
      setChats(prevChats => {
        const updatedChats = [...prevChats];
        const chatIndex = updatedChats.findIndex(c => c.id === chat.id);

        if (chatIndex !== -1) {
          const updatedChat = { ...updatedChats[chatIndex] };
          updatedChat.messages = [...updatedChat.messages, tempMessage];
          updatedChat.date_updated = new Date().toISOString();
          updatedChats[chatIndex] = updatedChat;
        }

        return updatedChats;
      });

      // Clear the input field after sending
      setNewMessage("");

      // Send the actual message to the server
      await apiRequest(
        'post',
        "http://localhost:8000/send_message/",
        {
          chat: chat.id,
          message: newMessage,
        }
      );

      // The WebSocket will handle updating the chat with the real message
      // and replace our temporary one
    } catch (error) {
      console.error("Error sending message:", error);
      setErrorMessage("Failed to send message. Please try again.");
    }
  }, [newMessage, chat.id, apiRequest, username]);


  // Initialize WebSocket connection
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      setErrorMessage("No access token found. Redirecting to login...");
      navigate("/login");
      return;
    }

    // Initial fetch to get existing chats
    fetchChats();

    // Create WebSocket connection
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//localhost:8000/ws/chat/?token=${accessToken}`;
    socketRef.current = new WebSocket(wsUrl);

    socketRef.current.onopen = () => {
      console.log('WebSocket connection established');
      setIsConnected(true);
      setErrorMessage("");
    };

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'new_message') {
        // Update the chat with the new message
        setChats(prevChats => {
          const updatedChats = [...prevChats];
          const chatIndex = updatedChats.findIndex(c => c.id === data.chat_id);

          if (chatIndex !== -1) {
            // Create a new chat object to ensure React detects the change
            const updatedChat = { ...updatedChats[chatIndex] };
            updatedChat.messages = [...updatedChat.messages, data.message];
            updatedChat.date_updated = new Date().toISOString();

            // Only increment unread count if this isn't the current chat or if it's not from the current user
            if (data.message.sent_by_username !== username) {
              if (chat.id !== data.chat_id) {
                updatedChat.unread_messages = (updatedChat.unread_messages || 0) + 1;
              }
            }

            // Replace the chat in the array with our updated version
            updatedChats[chatIndex] = updatedChat;

            // If this is the current chat, update it and mark message as read
            if (chat.id === data.chat_id) {
              setChat(updatedChat);
              markMessagesAsRead([data.message]);
            }
          }

          // Return the new array to trigger a re-render
          return updatedChats;
        });
      } else if (data.type === 'new_conversation') {
        // Add the new conversation to the list
        setChats(prevChats => [...prevChats, data.conversation]);
      } else if (data.type === 'message_read') {
        // Update message read status
        setChats(prevChats => {
          const updatedChats = [...prevChats];
          const chatIndex = updatedChats.findIndex(c => c.id === data.chat_id);

          if (chatIndex !== -1) {
            const updatedChat = { ...updatedChats[chatIndex] };
            updatedChat.messages = updatedChat.messages.map(msg =>
              msg.id === data.message_id ? { ...msg, is_read: true } : msg
            );

            // Also update unread_messages count when a message is read
            if (updatedChat.unread_messages > 0) {
              updatedChat.unread_messages -= 1;
            }

            updatedChats[chatIndex] = updatedChat;

            // If this is the current chat, update it
            if (chat.id === data.chat_id) {
              setChat(updatedChat);
            }
          }

          return updatedChats;
        });
      }
    };


    socketRef.current.onclose = (event) => {
      console.log('WebSocket connection closed', event);
      setIsConnected(false);

      // Attempt to reconnect after a delay if not intentionally closed
      if (!event.wasClean) {
        setTimeout(() => {
          if (socketRef.current?.readyState === WebSocket.CLOSED) {
            // Refresh token and try to reconnect
            refreshToken()
              .then(newToken => {
                const newWsUrl = `${wsProtocol}//localhost:8000/ws/chat/?token=${newToken}`;
                socketRef.current = new WebSocket(newWsUrl);
              })
              .catch(error => {
                console.error("Failed to refresh token for WebSocket reconnection:", error);
                setErrorMessage("Connection lost. Please refresh the page.");
              });
          }
        }, 3000);
      }
    };

    socketRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setErrorMessage("Connection error. Please check your internet connection.");
    };

    // Clean up the WebSocket connection when component unmounts
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [fetchChats, navigate, refreshToken, username, chat.id, markMessagesAsRead]);

  // Scroll to bottom of messages when updated
  const scrollToBottom = useCallback(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  // Memoize sorted messages for performance
  const sortedMessages = useMemo(() => {
    return chat.messages
      ? [...chat.messages].sort(
        (a, b) => new Date(a.date_created) - new Date(b.date_created)
      )
      : [];
  }, [chat.messages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [sortedMessages, scrollToBottom]);

  // Handle chat selection
  const handleChatSelect = useCallback(async (selectedChat) => {
    setChat(selectedChat);
    if (selectedChat.messages) {
      await markMessagesAsRead(selectedChat.messages);
    }
  }, [markMessagesAsRead]);

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h2 style={styles.sidebarTitle}>Conversations</h2>
          <div style={styles.sidebarActions}>
            <button
              style={styles.iconButton}
              onClick={() => setShowNewChatModal(true)}
              title="New conversation"
            >
              <i className="fas fa-pen"></i>
            </button>
            <button
              style={styles.iconButton}
              onClick={() => setShowGroupChatModal(true)}
              title="New group chat"
            >
              <i className="fas fa-users"></i>
            </button>
          </div>
        </div>
        <div style={styles.chatList}>
          {isLoading ? (
            <div style={styles.loadingIndicator}>Loading conversations...</div>
          ) : chats.length === 0 ? (
            <div style={styles.emptyState}>No conversations yet</div>
          ) : (
            chats.map((chatItem) => (
              <div
                key={chatItem.id}
                onClick={() => handleChatSelect(chatItem)}
                style={{
                  ...styles.chatItem,
                  backgroundColor: chat.id === chatItem.id ? "#edf2f7" : "transparent",
                }}
              >
                <div style={styles.chatItemContent}>
                  <h3 style={styles.chatItemTitle}>
                    {chatItem.is_group 
                      ? chatItem.subject 
                      : chatItem.participants_usernames?.filter(participantUsername => participantUsername !== username)[0] || chatItem.subject}
                  </h3>
                  <span style={styles.chatItemDate}>
                    {new Date(chatItem.date_updated).toLocaleDateString()}
                  </span>
                </div>
                {chatItem.unread_messages > 0 && (
                  <div style={styles.unreadBadge}>{chatItem.unread_messages}</div>
                )}
              </div>
            ))
          )}
        </div>
        {!isConnected && (
          <div style={styles.connectionStatus}>
            <span style={styles.offlineIndicator}></span>
            Offline - Reconnecting...
          </div>
        )}
      </div>

      <div style={styles.chatArea}>
        {errorMessage && (
          <div style={styles.errorBanner}>
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage("")}
              style={styles.dismissButton}
            >
              ×
            </button>
          </div>
        )}

        {Object.keys(chat).length > 0 ? (
          <>
            <div style={styles.chatHeader}>
              <h2 style={styles.chatTitle}>
                {chat.is_group
                  ? chat.subject
                  : chat.participants_usernames?.filter(participantUsername => participantUsername !== username)[0] || chat.subject}
              </h2>


              <div style={styles.chatParticipants}>
                {chat.participants && chat.participants.map(participant => (
                  <span key={participant.id} style={styles.participantBadge}>
                    {participant.username}
                  </span>
                ))}
              </div>
            </div>

            <div style={styles.messagesContainer}>
              {sortedMessages.length === 0 ? (
                <div style={styles.emptyMessagesState}>
                  No messages yet. Start the conversation!
                </div>
              ) : (
                sortedMessages.map((message) => (
                  <div
                    key={message.id}
                    style={{
                      ...styles.messageWrapper,
                      justifyContent:
                        message.sent_by_username === username ? "flex-end" : "flex-start",
                    }}
                  >
                    <div
                      style={{
                        ...styles.message,
                        ...(message.sent_by_username === username
                          ? styles.sentMessage
                          : styles.receivedMessage),
                      }}
                    >
                      {message.sent_by_username !== username && (
                        <div style={styles.messageSender}>{message.sent_by_username}</div>
                      )}
                      <div style={styles.messageContent}>{message.message}</div>
                      <div style={styles.messageFooter}>
                        <span style={styles.messageTime}>
                          {new Date(message.date_created).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {message.sent_by_username === username && (
                          <span style={styles.messageStatus}>
                            {message.is_read ? (
                              <i className="fas fa-check-double" style={styles.readIcon}></i>
                            ) : (
                              <i className="fas fa-check"></i>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messageEndRef} />
            </div>

            <form onSubmit={handleSendMessage} style={styles.messageForm}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                style={styles.messageInput}
                disabled={!isConnected}
              />
              <button
                type="submit"
                style={{
                  ...styles.sendButton,
                  opacity: !isConnected || !newMessage.trim() ? 0.5 : 1,
                  cursor: !isConnected || !newMessage.trim() ? 'not-allowed' : 'pointer'
                }}
                disabled={!isConnected || !newMessage.trim()}
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </form>
          </>
        ) : (
          <div style={styles.emptyChatState}>
            <h2>Select a conversation or create a new one</h2>
            <button
              style={styles.newChatButton}
              onClick={() => setShowNewChatModal(true)}
            >
              Start a new conversation
            </button>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>New Conversation</h3>
              <button
                style={styles.closeButton}
                onClick={() => {
                  setShowNewChatModal(false);
                  setSearchQuery("");
                  setSearchResults([]);
                  setSelectedUser(null);
                  setNewChatSubject("");
                }}
              >
                ×
              </button>
            </div>
            <div style={styles.modalBody}>
              <input
                type="text"
                placeholder="Search for users..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.length >= 3) {
                    searchUsers(e.target.value);
                  } else {
                    setSearchResults([]);
                  }
                }}
                style={styles.searchInput}
              />

              <div style={styles.searchResults}>
                {searchResults.length === 0 && searchQuery.length >= 3 ? (
                  <div style={styles.noResults}>No users found</div>
                ) : (
                  searchResults.map(user => (
                    <div
                      key={user.id}
                      style={{
                        ...styles.searchResultItem,
                        backgroundColor: selectedUser?.id === user.id ? '#edf2f7' : 'transparent'
                      }}
                      onClick={() => setSelectedUser(user)}
                    >
                      {user.username}
                    </div>
                  ))
                )}
              </div>

              {selectedUser && (
                <div style={styles.newChatForm}>
                  <label style={styles.inputLabel}>Conversation Subject</label>
                  <input
                    type="text"
                    placeholder="Enter a subject for your conversation"
                    value={newChatSubject}
                    onChange={(e) => setNewChatSubject(e.target.value)}
                    style={styles.subjectInput}
                  />
                </div>
              )}
            </div>
            <div style={styles.modalFooter}>
              <button
                style={styles.cancelButton}
                onClick={() => {
                  setShowNewChatModal(false);
                  setSearchQuery("");
                  setSearchResults([]);
                  setSelectedUser(null);
                  setNewChatSubject("");
                }}
              >
                Cancel
              </button>
              <button
                style={{
                  ...styles.createButton,
                  opacity: selectedUser && newChatSubject ? 1 : 0.5,
                  cursor: selectedUser && newChatSubject ? 'pointer' : 'not-allowed'
                }}
                disabled={!selectedUser || !newChatSubject}
                onClick={createNewConversation}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Group Chat Modal */}
      {showGroupChatModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>New Group Chat</h3>
              <button
                style={styles.closeButton}
                onClick={() => {
                  setShowGroupChatModal(false);
                  setSearchQuery("");
                  setSearchResults([]);
                  setSelectedUsers([]);
                  setNewChatSubject("");
                }}
              >
                ×
              </button>
            </div>
            <div style={styles.modalBody}>
              <input
                type="text"
                placeholder="Search for users..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.length >= 3) {
                    searchUsers(e.target.value);
                  } else {
                    setSearchResults([]);
                  }
                }}
                style={styles.searchInput}
              />

              <div style={styles.searchResults}>
                {searchResults.length === 0 && searchQuery.length >= 3 ? (
                  <div style={styles.noResults}>No users found</div>
                ) : (
                  searchResults.map(user => (
                    <div
                      key={user.id}
                      style={{
                        ...styles.searchResultItem,
                        backgroundColor: selectedUsers.some(u => u.id === user.id) ? '#edf2f7' : 'transparent'
                      }}
                      onClick={() => {
                        setSelectedUsers(prevUsers => {
                          // If user is already selected, remove them
                          if (prevUsers.some(u => u.id === user.id)) {
                            return prevUsers.filter(u => u.id !== user.id);
                          }
                          // Otherwise add them to selection
                          return [...prevUsers, user];
                        });
                      }}
                    >
                      <div style={styles.searchResultItemContent}>
                        <span>{user.username}</span>
                        {selectedUsers.some(u => u.id === user.id) && (
                          <i className="fas fa-check" style={styles.selectedUserCheck}></i>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {selectedUsers.length > 0 && (
                <>
                  <div style={styles.selectedUsersContainer}>
                    <label style={styles.inputLabel}>Selected Users ({selectedUsers.length})</label>
                    <div style={styles.selectedUsersList}>
                      {selectedUsers.map(user => (
                        <div key={user.id} style={styles.selectedUserBadge}>
                          {user.username}
                          <button
                            style={styles.removeUserButton}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedUsers(prevUsers =>
                                prevUsers.filter(u => u.id !== user.id)
                              );
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={styles.newChatForm}>
                    <label style={styles.inputLabel}>Group Chat Subject</label>
                    <input
                      type="text"
                      placeholder="Enter a subject for your group chat"
                      value={newChatSubject}
                      onChange={(e) => setNewChatSubject(e.target.value)}
                      style={styles.subjectInput}
                    />
                  </div>
                </>
              )}
            </div>
            <div style={styles.modalFooter}>
              <button
                style={styles.cancelButton}
                onClick={() => {
                  setShowGroupChatModal(false);
                  setSearchQuery("");
                  setSearchResults([]);
                  setSelectedUsers([]);
                  setNewChatSubject("");
                }}
              >
                Cancel
              </button>
              <button
                style={{
                  ...styles.createButton,
                  opacity: selectedUsers.length > 0 && newChatSubject ? 1 : 0.5,
                  cursor: selectedUsers.length > 0 && newChatSubject ? 'pointer' : 'not-allowed'
                }}
                disabled={selectedUsers.length === 0 || !newChatSubject}
                onClick={createNewGroupConversation}
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    height: "calc(100vh - 64px)",
    backgroundColor: "#f7fafc",
  },
  sidebar: {
    width: "320px",
    borderRight: "1px solid #e2e8f0",
    backgroundColor: "white",
    display: "flex",
    flexDirection: "column",
  },
  sidebarHeader: {
    padding: "20px",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sidebarTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "600",
    color: "#2d3748",
  },
  chatList: {
    flex: 1,
    overflowY: "auto",
    padding: "8px 0",
  },
  chatItem: {
    padding: "16px 20px",
    cursor: "pointer",
    transition: "background-color 0.2s",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: "4px",
    margin: "0 8px 4px 8px",
  },
  chatItemContent: {
    flex: 1,
  },
  chatItemTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "500",
    color: "#2d3748",
    marginBottom: "4px",
    textOverflow: "ellipsis",
    overflow: "hidden",
    whiteSpace: "nowrap",
  },
  chatItemDate: {
    fontSize: "12px",
    color: "#718096",
  },
  unreadBadge: {
    backgroundColor: "#4299e1",
    color: "white",
    borderRadius: "12px",
    padding: "2px 8px",
    fontSize: "12px",
    fontWeight: "500",
    minWidth: "24px",
    textAlign: "center",
  },
  chatArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  chatHeader: {
    padding: "20px",
    borderBottom: "1px solid #e2e8f0",
    backgroundColor: "white",
  },
  chatTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: "8px",
  },
  chatParticipants: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  participantBadge: {
    backgroundColor: "#e2e8f0",
    color: "#4a5568",
    borderRadius: "12px",
    padding: "2px 10px",
    fontSize: "12px",
  },
  messagesContainer: {
    flex: 1,
    padding: "20px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  messageWrapper: {
    display: "flex",
    width: "100%",
  },
  message: {
    maxWidth: "70%",
    padding: "12px 16px",
    borderRadius: "12px",
    position: "relative",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
  },
  sentMessage: {
    backgroundColor: "#4299e1",
    color: "white",
    borderBottomRightRadius: "4px",
  },
  receivedMessage: {
    backgroundColor: "white",
    color: "#2d3748",
    borderBottomLeftRadius: "4px",
  },
  messageSender: {
    fontSize: "12px",
    fontWeight: "500",
    marginBottom: "4px",
    opacity: 0.8,
  },
  messageContent: {
    fontSize: "14px",
    lineHeight: "1.5",
    wordBreak: "break-word",
  },
  messageFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "4px",
  },
  messageTime: {
    fontSize: "11px",
    opacity: 0.8,
  },
  messageStatus: {
    fontSize: "12px",
  },
  readIcon: {
    color: "#38b2ac",
  },
  messageForm: {
    padding: "20px",
    backgroundColor: "white",
    borderTop: "1px solid #e2e8f0",
    display: "flex",
    gap: "12px",
  },
  messageInput: {
    flex: 1,
    padding: "12px 16px",
    borderRadius: "24px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s",
    "&:focus": {
      borderColor: "#4299e1",
    },
  },
  sendButton: {
    backgroundColor: "#4299e1",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "44px",
    height: "44px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    cursor: "pointer",
    transition: "background-color 0.2s",
    "&:hover": {
      backgroundColor: "#3182ce",
    },
  },
  emptyChatState: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    color: "#718096",
    gap: "20px",
  },
  emptyMessagesState: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#a0aec0",
    fontStyle: "italic",
  },
  newChatButton: {
    backgroundColor: "#4299e1",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s",
    "&:hover": {
      backgroundColor: "#3182ce",
    },
  },
  errorBanner: {
    padding: "10px 20px",
    backgroundColor: "#fed7d7",
    color: "#c53030",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dismissButton: {
    backgroundColor: "transparent",
    border: "none",
    color: "#c53030",
    fontSize: "18px",
    cursor: "pointer",
  },
  sidebarActions: {
    display: "flex",
    gap: "10px",
  },
  iconButton: {
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "50%",
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#4299e1",
    fontSize: "16px",
    transition: "background-color 0.2s",
    "&:hover": {
      backgroundColor: "#edf2f7",
    },
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "white",
    borderRadius: "8px",
    width: "500px",
    maxWidth: "90%",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    display: "flex",
    flexDirection: "column",
  },
  modalHeader: {
    padding: "16px 20px",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "600",
    color: "#2d3748",
  },
  closeButton: {
    backgroundColor: "transparent",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#718096",
  },
  modalBody: {
    padding: "20px",
    maxHeight: "400px",
    overflowY: "auto",
  },
  modalFooter: {
    padding: "16px 20px",
    borderTop: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
  },
  searchInput: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "6px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    marginBottom: "16px",
    outline: "none",
    "&:focus": {
      borderColor: "#4299e1",
    },
  },
  searchResults: {
    marginBottom: "16px",
    maxHeight: "200px",
    overflowY: "auto",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
  },
  searchResultItem: {
    padding: "10px 12px",
    cursor: "pointer",
    transition: "background-color 0.2s",
    "&:hover": {
      backgroundColor: "#f7fafc",
    },
    borderBottom: "1px solid #e2e8f0",
  },
  noResults: {
    padding: "10px 12px",
    color: "#a0aec0",
    fontStyle: "italic",
    textAlign: "center",
  },
  newChatForm: {
    marginTop: "16px",
  },
  inputLabel: {
    display: "block",
    marginBottom: "8px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#4a5568",
  },
  subjectInput: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "6px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    outline: "none",
    "&:focus": {
      borderColor: "#4299e1",
    },
  },
  cancelButton: {
    padding: "8px 16px",
    borderRadius: "6px",
    border: "1px solid #e2e8f0",
    backgroundColor: "white",
    color: "#4a5568",
    fontSize: "14px",
    cursor: "pointer",
    transition: "background-color 0.2s",
    "&:hover": {
      backgroundColor: "#f7fafc",
    },
  },
  createButton: {
    padding: "8px 16px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#4299e1",
    color: "white",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s",
    "&:hover": {
      backgroundColor: "#3182ce",
    },
  },
  loadingIndicator: {
    padding: "20px",
    textAlign: "center",
    color: "#a0aec0",
  },
  emptyState: {
    padding: "20px",
    textAlign: "center",
    color: "#a0aec0",
    fontStyle: "italic",
  },
  connectionStatus: {
    padding: "10px",
    borderTop: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "12px",
    color: "#e53e3e",
  },
  offlineIndicator: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#e53e3e",
  },
};

export default Chat;



