import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { socket } from '../utils/socket';
import ChatMessage from './ChatMessage';

function Chat({ handleWindow, windowed, setDonationData }) {
  const [input, setInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [inputPlaceholder, setInputPlaceholder] = useState('Input a username');
  const [inputError, setInputError] = useState(false);
  const [currentRoom, setCurrentRoom] = useState('room1');
  const [emojiDonateOpen, setEmojiDonateOpen] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showDonate, setShowDonate] = useState(false);
  const [donateMessage, setDonateMessage] = useState('');
  const [donateAmount, setDonateAmount] = useState(5);
  const [donateInputPlaceholder, setDonateInputPlaceholder] = useState('Input a message');
  const [donateInputError, setDonateInputError] = useState(false);

  // Handle chat message input field change
  const handleInputChange = (event) => {
    setInput(event.target.value);
  };

  // Emit username to server and connect socket
  const handleUsernameSubmit = (event) => {
      event.preventDefault();
      const username = input;

      // Try connecting to socket
      socket.auth = { username };
      socket.connect();

      // If connection is successful, prepare chat input field
      socket.on('connect', () => {
        setSocketConnected(true);
        setInputError(false);
        setInputPlaceholder('Write a message');
        setInput('');
      });
  };

  // Emit chat message to server and reset input field
  const handleMessageSubmit = (event) => {
    event.preventDefault();
    socket.emit('chat messages', input);
    setInput('');
  };

  // Handle donation message input field change
  const handleDonateInputChange = (event) => {
    setDonateMessage(event.target.value);
  };

  // Handle donation amount change
  const handleDonateAmountChange = (event) => {
    setDonateAmount(event.target.value);
  };

  // Emit donation message to and amount to server and reset input field
  const handleDonationSubmit = (event) => {
    event.preventDefault();
    setDonateMessage('');
    socket.emit('donations', donateAmount, donateMessage);
  };


  // Emit selected emoji to server
  const handleEmojiSubmit = (event) => {
    const emoji = event.target.value;
    socket.emit('chat messages', emoji, true);
  };

  // Join a chat room
  const joinRoom = (room) => {
    setChatMessages([]);
    socket.emit('join', room);
    setCurrentRoom(room);
  };

  // Handle emoji and donation popups
  const toggleEmoji = () => {
    // If emoji/donation popup is closed, open it
    if (!emojiDonateOpen) {
      setEmojiDonateOpen(true);
      setShowEmoji(true);
    } else {
      // If donate popup is open, close it and open emoji popup
      if (showDonate) {
        setShowDonate(false);
        setShowEmoji(true);
      }
      // If emoji popup is open, close it
      if (showEmoji) {
        setShowEmoji(false);
        setEmojiDonateOpen(false);
      }
    }
  };

  // Handle emoji and donation popups
  const toggleDonate = () => {
    // If emoji/donation popup is closed, open it
    if (!emojiDonateOpen) {
      setEmojiDonateOpen(true);
      setShowDonate(true);
    } else {
      // If emoji popup is open, close it and open donate popup
      if (showEmoji) {
        setShowEmoji(false);
        setShowDonate(true);
      }
      // If donate popup is open, close it
      if (showDonate) {
        setShowDonate(false);
        setEmojiDonateOpen(false);
      }
    }
  };

  // Handle incoming chat and donation events from server
  useEffect(() => {
    if (socketConnected) {

      // Join a room and get chat messages
      socket.emit('chat messages', '');
      socket.emit('join', currentRoom);
      socket.on('chat messages', (messages) => {
        setChatMessages(messages);
      });

      setDonateInputError(false);
      setDonateInputPlaceholder('Write a message');

      // Get donation messages
      socket.on('donations', (donation) => {
        setDonationData(donation);
      });
    } else if (socket.connected) {
      // If socket is connected, prepare chat input field and set socketConnected to true
      setInputPlaceholder('Write a message');
      setSocketConnected(true);
    }
  }, [socketConnected, currentRoom, setDonationData]);

  // Handle socket connection errors
  useEffect(() => {
    // Communicate connection errors to user by changing input field placeholder
    socket.on('connect_error', (err) => {
      if (err.message === 'invalid username') {
        setSocketConnected(false);
        setInputPlaceholder('Input a username');
      } else if (err.message === 'username taken') {
        setSocketConnected(false);
        setInputError(true);
        setInputPlaceholder('Username taken');
      } else {
        setSocketConnected(false);
        setInputPlaceholder('Input a username');
      }
    });
  }, []);

  return (
    <div className={windowed ? 'chat-container' : 'chat-container rounded-md'}>
      {/* Room selection and popup toggle */}
      <div id="buttons" className={windowed ? 'chat-buttons-container lg:justify-center lg:gap-10' : 'chat-buttons-container'}>
        <button
          className={currentRoom === 'room1' ? 'btn bg-oc-test hover:bg-oc-test text-black' : 'btn'}
          onClick={() => {
            joinRoom('room1');
          }}
        >
          Room 1
        </button>
        <button
          className={currentRoom === 'room2' ? 'btn bg-oc-test hover:bg-oc-test text-black' : 'btn'}
          onClick={() => {
            joinRoom('room2');
          }}
        >
          Room 2
        </button>
        <button
          className={currentRoom === 'room3' ? 'btn bg-oc-test hover:bg-oc-test text-black' : 'btn'}
          onClick={() => {
            joinRoom('room3');
          }}
        >
          Room 3
        </button>
        <button className={windowed ? 'icon-btn bg-[url(./dock.svg)]' : 'icon-btn bg-[url(./pip.svg)]'} onClick={handleWindow}></button>
      </div>
      {/* Chat messages */}
      <div className="chat-messages">
        {chatMessages.map((message, index) => {
          return <ChatMessage message={message} key={index}></ChatMessage>;
        })}
      </div>
      {/* Emojies and donations */}
      <div className={emojiDonateOpen ? 'w-full p-2 relative' : 'w-full p-0 relative'}>
        <div className={emojiDonateOpen ? 'emoji-container' : 'h-0'}>
          <button
            className={emojiDonateOpen ? 'icon-btn emoji-toggle-btn' : 'icon-btn emoji-toggle-btn -top-8 border-solid border-oc-pastel-blue border-2'}
            style={emojiDonateOpen ? { borderRadius: '0.375rem 0.375rem 0 0' } : { borderRadius: '0.375rem' }}
            onClick={toggleEmoji}
          ></button>
          <button
            className={emojiDonateOpen ? 'icon-btn donate-toggle-btn' : 'icon-btn donate-toggle-btn -top-8 border-solid border-oc-pastel-blue border-2'}
            style={emojiDonateOpen ? { borderRadius: '0.375rem 0.375rem 0 0' } : { borderRadius: '0.375rem' }}
            onClick={toggleDonate}
          ></button>
          <div className={showEmoji && socketConnected ? 'flex gap-4 flex-wrap justify-center items-center' : 'hidden'}>
            <button className="icon-btn emoji-btn bg-[url(./logo.png)]" value={'logo'} onClick={handleEmojiSubmit}></button>
            <button className="icon-btn emoji-btn bg-[url(./capLamme.png)]" value={'capLamme'} onClick={handleEmojiSubmit}></button>
            <button className="icon-btn emoji-btn bg-[url(./capTea.png)]" value={'capTea'} onClick={handleEmojiSubmit}></button>
            <button className="icon-btn emoji-btn bg-[url(./fishBrain.png)]" value={'fishBrain'} onClick={handleEmojiSubmit}></button>
            <button className="icon-btn emoji-btn bg-[url(./moti.png)]" value={'moti'} onClick={handleEmojiSubmit}></button>
            <button className="icon-btn emoji-btn bg-[url(./poop.png)]" value={'poop'} onClick={handleEmojiSubmit}></button>
            <button className="icon-btn emoji-btn bg-[url(./catge.png)]" value={'catge'} onClick={handleEmojiSubmit}></button>
            <button className="icon-btn emoji-btn bg-[url(./dogege.png)]" value={'dogege'} onClick={handleEmojiSubmit}></button>
            <button className="icon-btn emoji-btn bg-[url(./pepeNo.png)]" value={'pepeNo'} onClick={handleEmojiSubmit}></button>
            <button className="icon-btn emoji-btn bg-[url(./pepeYes.png)]" value={'pepeYes'} onClick={handleEmojiSubmit}></button>
          </div>
          <div className={showEmoji && !socketConnected ? '' : 'hidden'}>
            <p className="text-white">Submit a username to emote</p>
          </div>
          <form
            className={showDonate && socketConnected ? 'h-full flex flex-col justify-around items-center' : 'hidden'}
            onSubmit={handleDonationSubmit}
          >
            <div className="w-full flex justify-around">
              <button
                className={donateAmount == 5 ? 'btn bg-oc-test hover:bg-oc-test text-black py-1' : 'btn bg-oc-pastel-blue py-1'}
                type="button"
                value={5}
                onClick={handleDonateAmountChange}
              >
                5€
              </button>
              <button
                className={donateAmount == 10 ? 'btn bg-oc-test hover:bg-oc-test text-black py-1' : 'btn bg-oc-pastel-blue py-1'}
                type="button"
                value={10}
                onClick={handleDonateAmountChange}
              >
                10€
              </button>
              <button
                className={donateAmount == 50 ? 'btn bg-oc-test hover:bg-oc-test text-black py-1' : 'btn bg-oc-pastel-blue py-1'}
                type="button"
                value={50}
                onClick={handleDonateAmountChange}
              >
                50€
              </button>
            </div>
            <div className="flex">
              <input
                type="text"
                value={donateMessage}
                onChange={handleDonateInputChange}
                className={donateInputError ? 'donate-input-error' : 'donate-input'}
                placeholder={donateInputPlaceholder}
              ></input>
              <button type="submit" className="btn my-2 mr-2 bg-oc-pastel-blue">
                Confirm
              </button>
            </div>
          </form>
          <div className={showDonate && !socketConnected ? '' : 'hidden'}>
            <p className="text-white">Submit a username to donate</p>
          </div>
        </div>
      </div>
      {/* Chat input form */}
      <form id="message-input" onSubmit={socketConnected ? handleMessageSubmit : handleUsernameSubmit} className="chat-form">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          className={inputError ? 'chat-input-error' : 'chat-input'}
          placeholder={inputPlaceholder}
        ></input>
        <button type="submit" className="w-9 h-9 bg-[url(../sendIcon.svg)] bg-cover absolute right-3"></button>
      </form>
    </div>
  );
}

Chat.propTypes = {
  handleWindow: PropTypes.func.isRequired,
  windowed: PropTypes.bool.isRequired,
  setDonationData: PropTypes.func.isRequired,
};

export default Chat;
