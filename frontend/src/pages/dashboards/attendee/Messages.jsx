import { useEffect, useMemo, useState } from "react";
import { Send, Search, User } from "lucide-react";

import {
  getMyMessages,
  sendMessage,
  markMessageAsRead,
} from "../../../services/api";

export default function AttendeeMessages() {
  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser
    ? JSON.parse(storedUser)
    : null;

  const [messages, setMessages] = useState([]);
  const [activeUserId, setActiveUserId] = useState("");
  const [search, setSearch] = useState("");
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState("");

  const loadMessages = async () => {
    try {
      setLoading(true);

      const data = await getMyMessages();

      if (Array.isArray(data)) {
        setMessages(data);

        if (!activeUserId && data.length > 0) {
          const firstMessage = data[0];

          const currentUserId =
            currentUser?.id || currentUser?._id;

          const otherUser =
            firstMessage.sender?._id === currentUserId
              ? firstMessage.receiver
              : firstMessage.sender;

          setActiveUserId(otherUser?._id || "");
        }
      } else {
        setMessageText(
          data.message || "Unable to load messages"
        );
      }
    } catch (error) {
      setMessageText("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const conversations = useMemo(() => {
    const conversationMap = new Map();

    const currentUserId =
      currentUser?.id || currentUser?._id;

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

      const conversation = {
        user: otherUser,
        lastMessage: message,
      };

      if (
        !existing ||
        new Date(message.createdAt) >
          new Date(existing.lastMessage.createdAt)
      ) {
        conversationMap.set(
          otherUser._id,
          conversation
        );
      }
    });

    return Array.from(conversationMap.values()).sort(
      (a, b) =>
        new Date(b.lastMessage.createdAt) -
        new Date(a.lastMessage.createdAt)
    );
  }, [messages, currentUser]);

  const filteredConversations =
    conversations.filter((conversation) => {
      const name =
        conversation.user?.companyName ||
        conversation.user?.name ||
        "";

      return name
        .toLowerCase()
        .includes(search.toLowerCase());
    });

  const activeConversation =
    conversations.find(
      (conversation) =>
        conversation.user?._id === activeUserId
    );

  const activeMessages = messages.filter(
    (message) =>
      message.sender?._id === activeUserId ||
      message.receiver?._id === activeUserId
  );

  const handleConversationClick = async (
    userId
  ) => {
    setActiveUserId(userId);
    setMessageText("");

    const currentUserId =
      currentUser?.id || currentUser?._id;

    const unreadMessages = messages.filter(
      (message) =>
        message.sender?._id === userId &&
        message.receiver?._id === currentUserId &&
        message.read === false
    );

    for (const message of unreadMessages) {
      await markMessageAsRead(message._id);
    }

    if (unreadMessages.length > 0) {
      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          unreadMessages.some(
            (unread) =>
              unread._id === message._id
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
    if (!replyText.trim() || !activeUserId) {
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
        setMessages((currentMessages) => [
          ...currentMessages,
          data.data,
        ]);

        setReplyText("");
      } else {
        setMessageText(
          data.message || "Unable to send message"
        );
      }
    } catch (error) {
      setMessageText("Unable to send message");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date) => {
    if (!date) {
      return "";
    }

    return new Date(date).toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Messages</h1>
          <p>
            Your conversations with exhibitors and support.
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
            style={{ padding: 14 }}
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
          ) : filteredConversations.length === 0 ? (
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
                  conversation.user.companyName ||
                  conversation.user.name ||
                  "User";

                return (
                  <div
                    key={conversation.user._id}
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
                        justifyContent: "center",
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
                      </div>

                      <div className="preview">
                        {
                          conversation
                            .lastMessage.message
                        }
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
                    justifyContent: "center",
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
                    style={{ fontSize: 12 }}
                  >
                    {activeConversation.user.role}
                  </div>
                </div>
              </div>

              <div className="chat-messages">
                {activeMessages.map(
                  (message) => {
                    const currentUserId =
                      currentUser?.id ||
                      currentUser?._id;

                    const isMine =
                      message.sender?._id ===
                      currentUserId;

                    return (
                      <div
                        key={message._id}
                        className={`msg-bubble${
                          isMine ? " me" : ""
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
                )}
              </div>

              <div className="chat-input-row">
                <input
                  className="input"
                  placeholder="Type a message..."
                  value={replyText}
                  onChange={(e) =>
                    setReplyText(e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
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