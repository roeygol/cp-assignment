import stompit, { Client } from 'stompit';
import { config } from '../config.js';

export class MessageService {
  private stompClient: Client | null = null;
  private readonly QUEUE_ORDER_CREATED = '/queue/sales.order.created';
  private readonly QUEUE_DELIVERY_STATUS = '/queue/delivery.order.status';

  async connect(): Promise<Client> {
    if (this.stompClient) return this.stompClient;
    return await this.connectWithRetry();
  }

  private connectWithRetry(): Promise<Client> {
    return new Promise((resolve) => {
      const connectOptions = {
        host: config.ACTIVEMQ_HOST,
        port: config.ACTIVEMQ_PORT,
        connectHeaders: {
          host: '/',
          login: config.ACTIVEMQ_USER,
          passcode: config.ACTIVEMQ_PASSWORD,
          'heart-beat': '5000,5000'
        }
      };

      const attempt = (): void => {
        stompit.connect(connectOptions, (error: Error | null, client: Client | null) => {
          if (error) {
            console.error('ActiveMQ connect error, retrying in 2s', error.message);
            setTimeout(attempt, 2000);
            return;
          }
          if (!client) {
            console.error('No client returned from stompit.connect');
            setTimeout(attempt, 2000);
            return;
          }
          this.stompClient = client;
          this.setupClientEventHandlers(client);
          resolve(client);
        });
      };
      attempt();
    });
  }

  private setupClientEventHandlers(client: Client): void {
    client.on('error', (err: Error) => {
      console.error('ActiveMQ client error', err.message);
    });
    client.on('end', () => {
      console.warn('ActiveMQ connection ended, reconnecting...');
      this.stompClient = null;
      setTimeout(() => this.connect(), 1000);
    });
  }

  async subscribeToOrderCreated(callback: (message: any) => Promise<void>): Promise<void> {
    const client = await this.connect();
    client.subscribe({ 
      destination: this.QUEUE_ORDER_CREATED, 
      ack: 'client-individual' 
    }, async (err: Error | null, message: any) => {
      if (err) {
        console.error('subscription error', err.message);
        return;
      }
      if (!message) {
        console.error('No message received');
        return;
      }
      
      try {
        await callback(message);
        client.ack(message);
      } catch (error) {
        console.error('Error processing message:', error);
        client.nack(message);
      }
    });
  }

  async publishDeliveryStatus(event: any): Promise<void> {
    const client = await this.connect();
    return new Promise<void>((resolve, reject) => {
      const frame = client.send({ 
        destination: this.QUEUE_DELIVERY_STATUS, 
        'content-type': 'application/json' 
      });
      frame.write(JSON.stringify(event));
      frame.end();
      resolve(); // stompit send is fire-and-forget
    });
  }
}
