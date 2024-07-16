'use client';
import { useChatStore } from '@/Zustand/chat.store';
import { DeleteOutlined, EditOutlined, SendOutlined, SmileOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import avatar1 from '../../assets/images/avatar1.svg';
import avatar2 from '../../assets/images/avatar2.svg';
import avatar3 from '../../assets/images/avatar3.svg';
import avatar4 from '../../assets/images/avatar4.svg';
import readedIcon from '../../assets/images/readed.svg';
import s from './style.module.css';

const users = [avatar1, avatar2, avatar3, avatar4];

const emojies = ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍'];

export const Chat = () => {
  const { data, setData, saveEdit, loading, deleteMsg, setLoading } = useChatStore();
  const [message, setMessage] = useState<Record<string, any>>({ id: null, text: '' });
  const [user, setUser] = useState('');
  const chatRef = useRef<HTMLDivElement>(null);
  const [emojiMenu, setEmojiMenu] = useState(false);

  const handleChangeMessage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage({ ...message, text: e.target.value });
  };

  const handleCloseEmojiMenu = () => {
    setEmojiMenu(false);
  };

  const handleEdit = (e: React.MouseEvent<HTMLButtonElement>, message: Record<string, any>) => {
    e.stopPropagation();
    setMessage(message);
  };

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const id = data.length < 1 ? 0 : data[data.length - 1].id + 1;
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () =>
        setData({
          id,
          prof: 'Owner',
          img: avatar2,
          name: user,
          text: message.text,
          chatImg: reader.result,
          time: dayjs().format('HH:mm A'),
          deleted: false
        });
      setTimeout(() => {
        botAnswer(id);
        chatScroll();
      }, 400);
    }
  };

  const cancelEdit = () => {
    setMessage({ id: null, text: '' });
  };

  const handleSaveEdit = () => {
    saveEdit(message);
    setMessage({ id: null, text: '' });
  };

  const handleDelete = (id: number) => {
    deleteMsg(id);
  };

  const chatScroll = () => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  };

  const botAnswer = (id: number) => {
    const msg = {
      id: id + 1,
      prof: 'Engineering',
      img: avatar1,
      name: 'Bot',
      time: dayjs().format('HH:mm A'),
      text: 'Hello World!'
    };
    setData(msg);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.text) return;
    if (message.id) return handleSaveEdit();

    const id = data.length < 1 ? 0 : data[data.length - 1].id + 1;

    const msg = {
      id,
      prof: 'Owner',
      img: avatar2,
      name: user,
      text: message.text,
      time: dayjs().format('HH:mm A'),
      deleted: false
    };

    setData(msg);
    setMessage({ id: null, text: '' });
    chatScroll();

    setTimeout(() => {
      botAnswer(id);
      chatScroll();
    }, 400);
  };

  useEffect(() => {
    chatScroll();
  }, [chatRef, data]);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
    const user = localStorage.getItem('user');
    if (user) setUser(user);
    localStorage.setItem('user', 'You');
    window.addEventListener('click', cancelEdit);
    window.addEventListener('click', handleCloseEmojiMenu);

    return () => {
      window.removeEventListener('click', cancelEdit);
      window.removeEventListener('click', handleCloseEmojiMenu);
    };
  }, []);

  return (
    <div className={s.chat}>
      <div className={s.header}>
        <div className={s.users}>
          {users.map((user, i) => (
            <Image
              key={i}
              src={user}
              width={24}
              height={24}
              alt='user'
              style={{ transform: `translateX(${i * -5}px)` }}
            />
          ))}
        </div>
        <div className={s.chatTitle}>
          <h2>🦄 Team Unicorns</h2>
          <p>last seen 45 minutes ago</p>
        </div>
        <button>•••</button>
      </div>
      <div className={s.content} ref={chatRef}>
        {loading ? (
          <p className={s.loading}>Loading...</p>
        ) : (
          <>
            <p className={s.todayDate}>{dayjs().format('M/DD/YYYY')}</p>
            {data.map((msg) => (
              <div
                key={msg.id}
                className={s.message}
                data-edit={msg.id === message.id}
                data-deleted={msg.deleted}
                data-you={msg.name === user}>
                {msg.name !== user && <Image src={msg.img} width={32} height={32} alt='user' />}
                <div className={s.textBlock}>
                  {msg.name === user && !msg.deleted && (
                    <>
                      <button className={s.deleteBtn} onClick={() => handleDelete(msg.id)}>
                        <DeleteOutlined />
                      </button>
                      {!msg.chatImg && (
                        <button className={s.editBtn} onClick={(e) => handleEdit(e, msg)}>
                          <EditOutlined />
                        </button>
                      )}
                    </>
                  )}
                  {msg.name !== user && (
                    <span className={s.name}>
                      <b>{msg.name}</b> {msg.prof}
                    </span>
                  )}
                  {msg.text && <p className={s.text}>{msg.deleted ? 'This message was deleted' : msg.text}</p>}
                  {msg.chatImg && <Image src={msg.chatImg} alt='chat img' width={100} height={100} />}
                  <div className={s.time}>
                    <span>{msg.time}</span>
                    {msg.name === user && !msg.deleted && <Image src={readedIcon} width={16} height={8} alt='readed' />}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
      <form className={s.footer} onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}>
        <div className={s.emojiBlock} onClick={() => setEmojiMenu(!emojiMenu)}>
          <SmileOutlined />
          {emojiMenu && (
            <ul className={s.emojiMenu}>
              {emojies.map((emoji, i) => (
                <li
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setMessage({ ...message, text: message.text + emoji });
                  }}>
                  {emoji}
                </li>
              ))}
            </ul>
          )}
        </div>
        <input type='text' placeholder='Start typing...' onChange={handleChangeMessage} value={message.text} />
        <label>
          <span>@</span>
          <input type='file' onChange={handleImage} />
        </label>
        <button type='submit' disabled={!message.text}>
          <SendOutlined />
        </button>
      </form>
    </div>
  );
};
