const Redis = require('redis');

const client = Redis.createClient({
    url: 'redis://localhost:6379'
});

client.on('error', (err) => console.log('Redis Client Error', err));
client.on('connect', () => console.log('Redis Client Connected'));

async function testConnection() {
    await client.connect();
    await client.set('test', 'Hello Redis');
    const value = await client.get('test');
    console.log(value);
    await client.quit();
}

testConnection().catch(console.error);