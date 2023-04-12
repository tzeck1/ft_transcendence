import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-oauth2';
import { Users } from './user/user.service';
import axios from 'axios';
import fetch from 'node-fetch';

@Injectable()
export class Api42Strategy extends PassportStrategy(Strategy, 'api42') {
  constructor(private readonly users: Users) {
    const options = {
      authorizationURL: 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-8b9da2df9f37fabf5fe6330ad83da6cf15f65455a8add2bc5d0ebda92eaf4b88&redirect_uri=http%3A%2F%2F10.11.4.27%3A3000%2Fauth%2Fapi42%2Fcallback&response_type=code',
      tokenURL: 'https://api.intra.42.fr/oauth/token',
      clientID: process.env.API_42_CLIENT_ID,
      clientSecret: process.env.API_42_CLIENT_SECRET,
      callbackURL: process.env.API_42_CALLBACK_URL || 'http://10.11.4.27:3000/auth/api42/callback',
      scope: ['public profile'],
    };

    super(options);
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    try {
      // Fetch user data from the 42 API using the accessToken
      const response = await axios.get('https://api.intra.42.fr/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const api42User = response.data;
  
      // console.log("api42User:", api42User);
      const userData = {
        displayName: api42User.login, // Replace this with the actual field name in the 42 API user data
        photos: api42User.image.link ? [{ value: api42User.image.link }] : [], // Replace this with the actual field name in the 42 API user data
      };

      this.users.createNewUser(userData.displayName); // if user doesn't exist, creates new entry in users and stats tables

      // console.log("User data in validate:", userData);
      done(null, userData);
    } catch (error) {
      console.error('Error fetching user data from 42 API:', error);
      done(error);
    }
  }
}
