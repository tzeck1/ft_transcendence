import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-oauth2';
import { Users } from '../user/user.service';
import axios from 'axios';
import fetch from 'node-fetch';
import { User } from './user.type';
import { AuthController } from './auth.controller';

@Injectable()
export class Api42Strategy extends PassportStrategy(Strategy, 'api42') {

	constructor(private readonly users: Users) {
		const options = {
			authorizationURL: 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-8b9da2df9f37fabf5fe6330ad83da6cf15f65455a8add2bc5d0ebda92eaf4b88&redirect_uri=http%3A%2F%2F10.13.3.7%3A3000%2Fauth%2Fapi42%2Fcallback&response_type=code',
			tokenURL: 'https://api.intra.42.fr/oauth/token',
			clientID: process.env.API_42_CLIENT_ID,
			clientSecret: process.env.API_42_CLIENT_SECRET,
			callbackURL: process.env.API_42_CALLBACK_URL,
			scope: ['public profile'],
		};
		super(options);
	}

	async validate(accessToken: string, refreshToken: string, profile: any): Promise<User> {
		try {
			const response = await axios.get('https://api.intra.42.fr/v2/me', {
				headers: { Authorization: `Bearer ${accessToken}` },
			});
			const api42User = response.data;
			const userData = {
				displayName: api42User.login,
				photos: api42User.image.link ? [{ value: api42User.image.link }] : [],
			};
			this.users.createNewUser(userData.displayName, api42User.image.link); // if user doesn't exist, creates new entry in users and stats tables
			return (userData);
		} catch (error) {
			console.error('Error fetching user data from 42 API:', error);
		}
	}
}
