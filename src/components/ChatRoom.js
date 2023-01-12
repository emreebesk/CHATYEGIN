import React, { useEffect, useState, ChangeEvent, HTMLInputElement } from 'react'
import { over } from 'stompjs';
import SockJS from 'sockjs-client';

var stompClient = null;
var CryptoJS = require("crypto-js");

const ChatRoom = () => {
    const [privateChats, setPrivateChats] = useState(new Map());
    const [publicChats, setPublicChats] = useState([]);
    const [tab, setTab] = useState("CHATROOM");
    const [userData, setUserData] = useState({
        username: '',
        receivername: '',
        connected: false,
        message: '',
        senderFullName: ''
    });
/*    const [encData, setEncData] = useState({
        encMsg: ''
    });*/

    const [name, setName] = useState("");
    const [surName, setSurname] = useState("");
    useEffect(() => {
        console.log(userData);
    }, [userData]);

    const connect = () => {
        let Sock = new SockJS('http://localhost:8080/ws');
        stompClient = over(Sock);
        stompClient.connect({}, onConnected, onError);
    }

    const onConnected = () => {
        setUserData({ ...userData, "connected": true });
        stompClient.subscribe('/chatroom/public', onMessageReceived);
        stompClient.subscribe('/user/' + userData.username + '/private', onPrivateMessage);
        userJoin();
    }

    const userJoin = () => {
        var chatMessage = {
            senderName: userData.username,
            senderFullName: splitName(userData.username),
            status: "JOIN"
        };
        stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
        /*console.log(cryptTheMessage(chatMessage));*/
    }

    const onMessageReceived = (payload) => {
        /*var bytes = CryptoJS.AES.decrypt(payload, 'my-secret-key@123');
        var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));  
        */
        var payloadData = JSON.parse(payload.body);
        switch (payloadData.status) {
            case "JOIN":    
                if (!privateChats.get(payloadData.senderFullName)) {
                    privateChats.set(payloadData.senderFullName, []);
                    
                    setPrivateChats(new Map(privateChats));
                    
                }
                break;
            case "MESSAGE":
                publicChats.push(payloadData);
                console.log(payloadData);
                setPublicChats([...publicChats]);
                
                break;
        }
    }


  /*  const cryptTheMessage = (message) =>{
        var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(message), 'my-secret-key@123').toString();
        
        return ciphertext;
    }
*/
    const onPrivateMessage = (payload) => {

     /*   console.log(payload);
        var bytes = CryptoJS.AES.decrypt(payload, 'my-secret-key@123');
        var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));*/
        var payloadData = JSON.parse(payload.body);
        if (privateChats.get(payloadData.senderFullName)) {
            privateChats.get(payloadData.senderFullName.push(payloadData));
            setPrivateChats(new Map(privateChats));
        } else {
            let list = [];
            list.push(payloadData);
            privateChats.set(payloadData.senderFullName, list);
            setPrivateChats(new Map(privateChats));
        }
    }

    const onError = (err) => {
        console.log(err);

    }

    const handleMessage = (event) => {
        const { value } = event.target;
        setUserData({ ...userData, "message": value });
    }
    const sendValue = () => {
        if (stompClient) {
            var chatMessage = {
                senderName: userData.username,
                message: userData.message,
                status: "MESSAGE"
            };
            
            stompClient.send("/app/message", {}, JSON.stringify(chatMessage));                    
            setUserData({ ...userData, "message": "" });
        }
    }
 
 
 
 
    const [myInput, setSearch] = useState('');
    const handleChange = (event) => {
        setSearch(event.target.value);
    };
    
    //const filteredPrivateChats = Array.from(privateChats.keys()).filter(chat => chat.includes(searchValue));
    
    const sendPrivateValue = () => {
        if (stompClient) {
            var chatMessage = {
                senderName: userData.username,
                receiverName: tab,
                message: userData.message,
                status: "MESSAGE"
            };

            if (userData.username !== tab) {
                privateChats.get(tab).push(chatMessage);
                setPrivateChats(new Map(privateChats));
            }
            stompClient.send("/app/private-message", {}, JSON.stringify(chatMessage));
            setUserData({ ...userData, "message": "" });
        }
    }

    const splitName = (uName) => {
        let x = '';
        if(uName.endsWith("@ozu.edu.tr")){
            uName = userData.username.split("@")[0].split(".")[0];
            x = userData.username.split("@")[0].split(".")[1];
            uName = "Stu. " + uName + " " + x;
            uName = uName.toUpperCase();
            return uName;
        }else {
            uName = userData.username.split("@")[0].split(".")[0];
            x = userData.username.split("@")[0].split(".")[1];
            uName = "Ins. " + uName + " " + x;
            uName = uName.toUpperCase();
            return uName;
            }
    }
    const handleUsername = (event) => {
        const {value}=event.target;
    
        if(value.endsWith("@ozu.edu.tr")){
            setName(userData.username.split("@")[0].split(".")[0]);
            let n = name.toUpperCase();
            setSurname(userData.username.split("@")[0].split(".")[1]);
            let s = surName.toUpperCase();

           
            setUserData({...userData, "username": "S' "+ n +" " + s });
        }else {
            setName(userData.username.split("@")[0].split(".")[0]);
            let n = name.toUpperCase();
            setSurname(userData.username.split("@")[0].split(".")[1]);
            let s = name.toUpperCase();
            setUserData({...userData, "username": "I' "+ n +" " + s });
        }
        setUserData({...userData,"username": value});
        
    }

    
    const registerUser = () => {
        
        if((!userData.username.endsWith("@ozu.edu.tr")) && (!userData.username.endsWith("@ozyegin.edu.tr"))){
            alert("ONLY OZYEGIN MEMBERS ARE ALLOWED!")
        }else{
        let name;
        let firstName;
        let lastName;
        if(userData.username.endsWith("@ozu.edu.tr")){
            name = userData.username.split("@")[0];
            [firstName, lastName] = name.split(".");
            let uName = firstName + " " + lastName;
            const{value} = uName;
            setUserData({...userData, "username": "S' "+ uName });
            connect();
        }
        else{
            name = userData.username.split("@")[0];
            [firstName, lastName] = name.split(".");
            let uName = firstName + " " + lastName;
            const{value} = uName;
            setUserData({...userData, "username": "I' "+ uName });
            connect();
        }

        }
        
    }

    return (
        <div className="container">
            {userData.connected ?
                <div className="baslik">CHATYEGIN
                <div className="chat-box"> 
                    <div className="member-list">

                        <ul id="myUL">
                            <li onClick={() => { setTab("CHATROOM") }} className={`member ${tab === "CHATROOM" && "active"}`}>Chatroom</li>
                            
                            {[...privateChats.keys()].map((senderFullName, index) => (
                                <li onClick={() => { setTab(senderFullName) }} className={`member ${tab === senderFullName && "active"}`} key={index}>{senderFullName}</li>
                            ))}
                        </ul>
                    </div>
                    {tab === "CHATROOM" && <div className="chat-content">
                        <ul className="chat-messages">
                            {publicChats.map((chat, index) => (
                                <li className={`message ${chat.senderName === userData.username && "self"}`} key={index}>
                                    {chat.senderName !== userData.username && <div className="avatar">{chat.senderName}</div>}
                                    <div className="message-data">{chat.message}</div>
                                    {chat.senderName === userData.username && <div className="avatar self">{chat.senderName}</div>}
                                </li>
                            ))}
                        </ul>

                        <div className="send-message">
                            <input type="text" className="input-message" placeholder="enter the message" value={userData.message} onChange={handleMessage} />
                            <button type="button" className="send-button" onClick={sendValue}>send</button>
                        </div>
                    </div>}
                    {tab !== "CHATROOM" && <div className="chat-content">
                        <ul className="chat-messages">
                            {[...privateChats.get(tab)].map((chat, index) => (
                                <li className={`message ${chat.senderName === userData.username && "self"}`} key={index}>
                                    {chat.senderName !== userData.username && <div className="avatar">{chat.senderName}</div>}
                                    <div className="message-data">{chat.message}</div>
                                    {chat.senderName === userData.username && <div className="avatar self">{chat.senderName}</div>}
                                </li>
                            ))}
                        </ul>

                        <div className="send-message">
                            <input type="text" className="input-message" placeholder="enter the message" value={userData.message} onChange={handleMessage} />
                            <button type="button" className="send-button" onClick={sendPrivateValue}>send</button>
                        </div>
                    </div>}
                </div>
                </div>
                :
                <div className="register">
                    <div className="logo">
                    <img id="mainLogo" src={require('./logo.png')}/>
                    </div>
                    <div className="userName">
                    <input
                        id="user-name"
                        placeholder="Enter your OzU mail"
                        name="username"
                        value={userData.username}
                        onChange={handleUsername}
                        margin="normal"
                    />
                    <button id = "mainButton" type="button" onClick={registerUser}>
                        connect
                    </button>
                    </div>
                </div>}
        </div>
    )

}


export default ChatRoom
