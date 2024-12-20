import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../reducers/user';
import Image from 'next/image';
import styles from '../styles/SignIn.module.css';
import { useRouter } from 'next/router';

const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

const SignIn: React.FC = () => {
    const dispatch = useDispatch();
    const user = useSelector((state: { user: { value: any } }) => state.user.value);
    const router = useRouter();
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    
        if (!username || !password || !email) {
            alert('Veuillez remplir tous les champs.');
            return;
        }
    
        try {
            const response = await fetch(`${API_KEY}/users/signin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ username, password, email }),
            });
    
            if (!response.ok) throw new Error('Network response was not ok');
    
            const data = await response.json();
    
            if (data.result) {
                dispatch(login({ token: data.token, username, firstname: data.firstname, email: data.email }));
                router.push('/home');
            } else {
                setError(data.error || 'Une erreur est survenue');
            }
        } catch (error) {
            console.error('Erreur de fetch:', error);
            setError('Une erreur est survenue lors de la soumission.');
        }
    };

    return (
        <div className={styles.container}>
            <Image src="/logo.png" alt="Logo" width={50} height={50} />
            <h3 className={styles.title}>Connect to Hackatweet</h3>
            <form onSubmit={handleSubmit}>
                <input id='username' type="text" className={styles.input} 
                       onChange={(e) => setUsername(e.target.value)} 
                       autoComplete="current-username" value={username} 
                       placeholder="Username" />
                <input id='email' type="email" className={styles.input} 
                       onChange={(e) => setEmail(e.target.value)} 
                       value={email} autoComplete='current-email' 
                       placeholder="Email" />
                <input id='password' type="password" className={styles.input} 
                       onChange={(e) => setPassword(e.target.value)} 
                       value={password} autoComplete='current-password' 
                       placeholder="Password" />
                <button id='submit' type="submit" className={styles.button}>Sign in</button>
            </form>
            {error && <p className={styles.error}>{error}</p>}
        </div>
    );
};

export default SignIn;
