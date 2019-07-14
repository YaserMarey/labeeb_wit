'use strict';
// create an API server
const express = require('express');
const server = express()
const PORT = process.env.PORT || 3000;

// Tokens
const config = require('./config');

// FBeamer
const FBeamer = require('./fbeamer');

const f = new FBeamer(config.FB);

// 
const Restify = require('restify');
const RestifyPlugins = require('restify').plugins
server.use(RestifyPlugins.queryParser());
server.use(RestifyPlugins.bodyParser({ mapParams: false }));

// Register the webhooks
server.get('/', (req, res, next) => {
	f.registerHook(req, res);
	return next();
});

const {Wit, log} = require('node-wit');

const client = new Wit({
	accessToken: 'LMSC2YG6GLQNV4WHK4NPHNOXR4BHFETH'
	//,logger: new log.Logger(log.DEBUG) // optional
  });

const dm = require('./dialogmgt')

// Receive all incoming messages
server.post('/',
	(req, res, next) => f.verifySignature(req, res, next),
	Restify.plugins.bodyParser(),
	(req, res, next) => {
		f.incoming(req, res, msg => {
			console.log('Message is incoming!!!!')
			const {message, sender	} = msg;

			const firstEntityValue = (entities, entity) => {
				const val = entities && entities[entity] &&
				  Array.isArray(entities[entity]) &&
				  entities[entity].length > 0 &&
				  entities[entity][0].value
				;
				if (!val) {
				  return null;
				}
				return val;
			  };
			  
			if (message.text && message.nlp.entities) {
				try{
					client.message(message.text).then((data)=>{
						const intent = firstEntityValue(data.entities, 'intent');
						let extracted_entities = {}
						for (let entity in data.entities){
							if (entity!='intent'){
								extracted_entities[entity] = firstEntityValue(data.entities, entity);
							}
						}
						f.txt(sender, dm.figureNextAction(intent, extracted_entities, message));
					})
				}
				catch{
					console.log('error in wit.ai processing')
					console.error
				}

			}
		});
		return next();
	});

// Subscribe
f.subscribe();

server.listen(PORT, () => console.log(`FBeamer bot sercies running on port ${PORT}`));