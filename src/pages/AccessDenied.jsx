import React from 'react'
import { useNavigate } from 'react-router-dom'

function AccessDenied() {

    const navigate = useNavigate()

    return (
        <div style={styles.container}>
            <div style={styles.content}>
                <div style={styles.warningSign}>⚠️</div>
                <h1 style={styles.accessDeniedText}>Access Denied</h1>
                <div>
                    <button onClick={()=>{navigate('/')}} >Go To Home</button>
                </div>
            </div>
        </div>
    )
}

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100%',
        backgroundColor: '#f8f9fa'
    },
    content: {
        textAlign: 'center'
    },
    warningSign: {
        fontSize: '8rem',
        color: '#ffc107',
        marginBottom: '1rem'
    },
    accessDeniedText: {
        fontSize: '3.5rem',
        color: '#dc3545',
        fontWeight: 'bold',
        margin: 0
    }
}

export default AccessDenied
