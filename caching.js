import redis from 'redis';

const client = redis.createClient({
    url:'redis://localhost:6379'
});



client.connect().then(()=>console.log('connect to redis')).catch(console.error('error'));
export  default client;
