import React from 'react';
import { Card, CardContent, Typography, Avatar } from '@mui/material';

function MemberCard({ name, role, avatar }) {
  return (
    <Card sx={styles.card}>
      <CardContent sx={styles.content}>
        <Avatar 
          src={avatar} 
          alt={name}
          sx={styles.avatar}
        >
          {name[0].toUpperCase()}
        </Avatar>
        <Typography variant="h6" sx={styles.name}>
          {name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {role}
        </Typography>
      </CardContent>
    </Card>
  );
}

const styles = {
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: 3
    }
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center'
  },
  avatar: {
    width: 60,
    height: 60,
    marginBottom: 2
  },
  name: {
    fontSize: '1rem',
    fontWeight: 600,
    marginBottom: 1
  }
};

export default MemberCard;
