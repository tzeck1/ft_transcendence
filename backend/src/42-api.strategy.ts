import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-oauth2';

@Injectable()
export class Api42Strategy extends PassportStrategy(Strategy, 'api42') {
  constructor() {
    const options = {
      authorizationURL: 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-8b9da2df9f37fabf5fe6330ad83da6cf15f65455a8add2bc5d0ebda92eaf4b88&redirect_uri=http%3A%2F%2Flocalhost%3A8080&response_type=code',
      tokenURL: 'https://api.intra.42.fr/oauth/token',
      clientID: process.env.API_42_CLIENT_ID,
      clientSecret: process.env.API_42_CLIENT_SECRET,
      callbackURL: process.env.API_42_CALLBACK_URL,
      scope: ['public'],
    };

    console.log('Api42Strategy options:', options); // Add this line

    super(options);
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    // You can fetch user data from the API using the accessToken here
    // Store the user data in your database or in-memory
    // Call done() with the user data as the second argument

    // Example: done(null, { accessToken, refreshToken, profile });
  }
}