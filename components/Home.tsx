import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../reducers/user';
import { loadTweets, addTweet } from '../reducers/tweets';
import Link from 'next/link';
import Image from 'next/image';
import LastTweets from './LastTweets';
import Trends from './Trends';
import styles from '../styles/Home.module.css';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
console.log("Mon Api Key est : " + API_KEY);
const Home: React.FC = () => {
    const dispatch = useDispatch();
    const user = useSelector((state: { user: { value: any } }) => state.user.value);
    const router = useRouter();

    const tweetsData = useSelector((state: { tweets: { value: any[] } }) => state.tweets.value);

    useEffect(() => {
        if (!user.token) {
            router.push('/login');
        }
    }, [user.token, router]);

    const [newTweet, setNewTweet] = useState<string>('');

    useEffect(() => {
        if (!user.token) {
            return;
        }
        if (tweetsData.length > 0) {
            return; // Ne pas faire de repli si des tweets existent déjà
        }
        fetch(`${API_KEY}/tweets/all/${user.token}`)
        //  fetch(`http://localhost:3000/tweets/all/${user.token}`)
            .then(response => response.json())
            .then(data => {
                data.result && dispatch(loadTweets(data.tweets));
            });
    }, [dispatch, user.token]);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        if (value.length === 0 || value.startsWith('#')) { 
            
            setNewTweet(value);
        } else {
            alert('Veuillez entrer un contenu valide commençant par #');
        }
    };

    const handleSubmit = () => {
        if (!newTweet) return; // Ne rien faire si le tweet est vide
        fetch('http://localhost:3000/tweets', {
            //  || `${API_KEY}/tweets}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: user.token, content: newTweet }),
        }).then(response => response.json())
          .then(data => {
              if (data.result) {
                  const createdTweet = { ...data.tweet, author: user };
                  dispatch(addTweet(createdTweet));
                  setNewTweet(''); // Réinitialise le champ après l'envoi du tweet
              }
          }).catch(error => console.error(error));
    };

    return (
        <div className={styles.container}>
            <div className={styles.leftSection}>
                <Link href="/">
                    <Image src="/logo.png" alt="Logo" width={50} height={100} className={styles.logo} />
                </Link>
                <div className={styles.userSection}>
                    <Image src="/avatar.png" alt="Avatar" width={46} height={46} className={styles.avatar} />
                    <div className={styles.userInfo}>
                        <p className={styles.name}>{user.firstName}</p>
                        <p className={styles.username}>@{user.username}</p>
                    </div>
                    <button onClick={() => { router.push('/login'); dispatch(logout()); }} className={styles.logout}>Logout</button>
                </div>
            </div>

            <div className={styles.middleSection}>
                <h2 className={styles.title}>Home</h2>
                <div className={styles.createSection}>
                    <textarea
                        placeholder="What's up?"
                        className={styles.input}
                        onChange={handleInputChange}
                        value={newTweet}
                    />
                    <div className={styles.validateTweet}>
                        <p>{newTweet.length}/280</p> {/* Affichage du compteur de caractères */}
                        <button className={styles.button} onClick={handleSubmit}>Tweet</button>
                    </div>
                </div>
                <LastTweets />
            </div>

            <div className={styles.rightSection}>
                <h2 className={styles.title}>Trends</h2>
                <Trends />
            </div>
        </div>
    );
};

export default Home;
