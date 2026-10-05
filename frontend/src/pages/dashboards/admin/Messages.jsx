import { useEffect, useMemo, useState } from "react";
import {
  Send,
  Search,
  User,
} from "lucide-react";

import {
  getMyMessages,
  getMessageContacts,
  sendMessage,
  markMessageAsRead,
} from "../../../services/api";

export default function AdminMessages() {
  const storedUser = localStorage.getItem("user");

  const currentUser = storedUser
    ? JSON.parse(storedUser)
    : null;

  const currentUserId =
    currentUser?.id || currentUser?._id;

  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [activeUserId, setActiveUserId] =
    useState("");
  const [search, setSearch] = useState("");
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] =
    useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setMessageText("");

      const [messageData, contactData] =
        await Promise.all([
          getMyMessages(),
          getMessageContacts(),
        ]);

      const loadedMessages = Array.isArray(
        messageData
      )
        ? messageData
        : [];

      const loadedContacts = Array.isArray(
        contactData
      )
        ? contactData
        : [];

      setMessages(loadedMessages);
      setContacts(loadedContacts);

      if (
        !Array.isArray(messageData) &&
        messageData?.message
      ) {
        setMessageText(messageData.message);
      }

      if (
        !Array.isArray(contactData) &&
        contactData?.message
      ) {
        setMessageText(contactData.message);
      }
    } catch (error) {
      setMessageText(
        "Unable to connect to server"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const conversations = useMemo(() => {
    const conversationMap = new Map();

    contacts.forEach((contact) => {
      if (!contact?._id) {
        return;
      }

      conversationMap.set(contact._id, {
        user: contact,
        lastMessage: null,
      });
    });

    messages.forEach((message) => {
      const otherUser =
        message.sender?._id === currentUserId
          ? message.receiver
          : message.sender;

      if (!otherUser?._id) {
        return;
      }

      const existing =
        conversationMap.get(otherUser._id);

      if (!existing) {
        conversationMap.set(otherUser._id, {
          user: otherUser,
          lastMessage: message,
        });

        return;
      }

      if (
        !existing.lastMessage ||
        new Date(message.createdAt) >
          new Date(
            existing.lastMessage.createdAt
          )
      ) {
        conversationMap.set(otherUser._id, {
          ...existing,
          user: {
            ...existing.user,
            ...otherUser,
          },
          lastMessage: message,
        });
      }
    });

    return Array.from(
      conversationMap.values()
    ).sort((a, b) => {
      if (
        a.lastMessage &&
        b.lastMessage
      ) {
        return (
          new Date(
            b.lastMessage.createdAt
          ) -
          new Date(
            a.lastMessage.createdAt
          )
        );
      }

      if (a.lastMessage) {
        return -1;
      }

      if (b.lastMessage) {
        return 1;
      }

      const aName =
        a.user?.companyName ||
        a.user?.name ||
        "";

      const bName =
        b.user?.companyName ||
        b.user?.name ||
        "";

      return aName.localeCompare(bName);
    });
  }, [
    contacts,
    messages,
    currentUserId,
  ]);

  useEffect(() => {
    if (
      !activeUserId &&
      conversations.length > 0
    ) {
      setActiveUserId(
        conversations[0].user._id
      );
    }
  }, [
    conversations,
    activeUserId,
  ]);

  const filteredConversations =
    conversations.filter(
      (conversation) => {
        const name =
          conversation.user?.companyName ||
          conversation.user?.name ||
          "";

        const role =
          conversation.user?.role || "";

        const query =
          search.toLowerCase();

        return (
          name
            .toLowerCase()
            .includes(query) ||
          role
            .toLowerCase()
            .includes(query)
        );
      }
    );

  const activeConversation =
    conversations.find(
      (conversation) =>
        conversation.user?._id ===
        activeUserId
    );

  const activeMessages = messages.filter(
    (message) => {
      const senderId =
        message.sender?._id;

      const receiverId =
        message.receiver?._id;

      return (
        (senderId === currentUserId &&
          receiverId === activeUserId) ||
        (senderId === activeUserId &&
          receiverId === currentUserId)
      );
    }
  );

  const handleConversationClick =
    async (userId) => {
      setActiveUserId(userId);
      setMessageText("");

      const unreadMessages =
        messages.filter(
          (message) =>
            message.sender?._id ===
              userId &&
            message.receiver?._id ===
              currentUserId &&
            message.read === false
        );

      for (const message of unreadMessages) {
        await markMessageAsRead(
          message._id
        );
      }

      if (
        unreadMessages.length > 0
      ) {
        setMessages(
          (currentMessages) =>
            currentMessages.map(
              (message) =>
                unreadMessages.some(
                  (unread) =>
                    unread._id ===
                    message._id
                )
                  ? {
                      ...message,
                      read: true,
                    }
                  : message
            )
        );
      }
    };

  const handleSend = async () => {
    if (
      !replyText.trim() ||
      !activeUserId
    ) {
      return;
    }

    try {
      setSending(true);
      setMessageText("");

      const data = await sendMessage(
        activeUserId,
        replyText
      );

      if (data.data) {
        setMessages(
          (currentMessages) => [
            ...currentMessages,
            data.data,
          ]
        );

        setReplyText("");
      } else {
        setMessageText(
          data.message ||
            "Unable to send message"
        );
      }
    } catch (error) {
      setMessageText(
        "Unable to send message"
      );
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date) => {
    if (!date) {
      return "";
    }

    return new Date(
      date
    ).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleLabel = (role) => {
    if (role === "exhibitor") {
      return "Exhibitor";
    }

    if (role === "attendee") {
      return "Attendee";
    }

    if (role === "admin") {
      return "Organizer";
    }

    return "User";
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Messages</h1>

          <p>
            Conversations with exhibitors
            and attendees.
          </p>
        </div>
      </div>

      {messageText && (
        <div
          style={{
            marginBottom: 16,
            fontSize: 14,
          }}
        >
          {messageText}
        </div>
      )}

      <div className="chat-shell">
        <div className="chat-list">
          <div
            style={{
              padding: 14,
            }}
            className="input-icon-wrap"
          >
            <Search size={15} />

            <input
              className="input"
              placeholder="Search conversations"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>

          {loading ? (
            <div className="empty-state">
              Loading messages...
            </div>
          ) : filteredConversations
              .length === 0 ? (
            <div className="empty-state">
              No conversations yet.
            </div>
          ) : (
            filteredConversations.map(
              (conversation) => {
                const active =
                  conversation.user._id ===
                  activeUserId;

                const displayName =
                  conversation.user
                    .companyName ||
                  conversation.user.name ||
                  "User";

                return (
                  <div
                    key={
                      conversation.user._id
                    }
                    className={`chat-list-item${
                      active ? " active" : ""
                    }`}
                    onClick={() =>
                      handleConversationClick(
                        conversation.user._id
                      )
                    }
                    style={{
                      cursor: "pointer",
                    }}
                  >
                    <div
                      className="avatar-round"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent:
                          "center",
                      }}
                    >
                      <User size={16} />
                    </div>

                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <div className="flex justify-between">
                        <span className="name">
                          {displayName}
                        </span>

                        {conversation.lastMessage && (
                          <span
                            className="text-muted"
                            style={{
                              fontSize: 11,
                            }}
                          >
                            {formatTime(
                              conversation
                                .lastMessage
                                .createdAt
                            )}
                          </span>
                        )}
                      </div>

                      <div
                        className="text-muted"
                        style={{
                          fontSize: 11,
                          marginBottom: 3,
                        }}
                      >
                        {getRoleLabel(
                          conversation.user.role
                        )}
                      </div>

                      <div className="preview">
                        {conversation
                          .lastMessage
                          ?.message ||
                          "Start a conversation"}
                      </div>
                    </div>
                  </div>
                );
              }
            )
          )}
        </div>

        <div className="chat-window">
          {!activeConversation ? (
            <div className="empty-state">
              Select a conversation.
            </div>
          ) : (
            <>
              <div className="chat-header">
                <div
                  className="avatar-round"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      "center",
                  }}
                >
                  <User size={16} />
                </div>

                <div>
                  <div className="cell-strong">
                    {activeConversation.user
                      .companyName ||
                      activeConversation.user
                        .name}
                  </div>

                  <div
                    className="text-muted"
                    style={{
                      fontSize: 12,
                    }}
                  >
                    {getRoleLabel(
                      activeConversation.user
                        .role
                    )}
                  </div>
                </div>
              </div>

              <div className="chat-messages">
                {activeMessages.length ===
                0 ? (
                  <div className="empty-state">
                    No messages yet. Start
                    the conversation.
                  </div>
                ) : (
                  activeMessages.map(
                    (message) => {
                      const isMine =
                        message.sender?._id ===
                        currentUserId;

                      return (
                        <div
                          key={message._id}
                          className={`msg-bubble${
                            isMine
                              ? " me"
                              : ""
                          }`}
                        >
                          <div>
                            {message.message}
                          </div>

                          <div
                            style={{
                              fontSize: 10,
                              marginTop: 5,
                              opacity: 0.7,
                            }}
                          >
                            {formatTime(
                              message.createdAt
                            )}
                          </div>
                        </div>
                      );
                    }
                  )
                )}
              </div>

              <div className="chat-input-row">
                <input
                  className="input"
                  placeholder="Type a message..."
                  value={replyText}
                  onChange={(e) =>
                    setReplyText(
                      e.target.value
                    )
                  }
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter"
                    ) {
                      handleSend();
                    }
                  }}
                />

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSend}
                  disabled={
                    sending ||
                    !replyText.trim()
                  }
                >
                  <Send size={15} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}