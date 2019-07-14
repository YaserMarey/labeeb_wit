'use strict';
let utters = {
  utter_ask_course:['Nice to meet you {student_name}, May I ask you what was the last course, you took in OMSCS?',
'Pleased to meet you {student_name}, I knew you are an OMSCS student, May I know what was the last course you took?',
'Glad I am talking to you {student_name}, You are an OMSCS student if I am right, what was your last course?'],

utter_thanks:['That was nice review, good luck in your courses, thanks','Nice, good luck in your courses, thank you'],

utter_greet:['Hello my name is Labeeb, tell me your name.','Hi, this is Labeeb, what is your name',
'Hello, my name is Labeeb, what\'s your name','Hello, my name is Labeeb, may I know your name',
'Salam, my name is Labeeb, what\'s your name'],

utter_goodbye:['Take care, talk to you later','bye bye','goodbye'],

utter_ask_difficulty:['Alright, and how do you briefly describe the difficulty level of this course:{course_name}?',
'Ok, how difficult is this course: {course_name}?'],

utter_ask_assignments:['how do you describe the assignments of this course?'],

utter_ask_mentors:['how do you describe the course TA\'s and Professors ?'],

utter_ask_lectures:['Alright, and how do you describe the lectures ?'],

utter_ask_scale:[', ok this is the last question, I promise :) , \
so on a scale form 1 to 5 where 1 is the worst, and 5 is the best, how do you rate this course']
}

let sentiment_msgs = {
goodgood:['Good good :-), ', 'Great :-), ', 'Very good :-), '], 
good:['Alright :-|, ', 'Ok :-|, ', 'Yes :-|, '], 
badbad:['Oh, sorry to hear that :-/, ', 'That is unfortunate :-/, '], 
bad:['Hmmm :-|, ', 'Ok :-|, ']}

// TODO
var sentiment_scores = {difficulty:0.0, assignments: 0.0, mentors: 0.0, lectures: 0.0}

let next_action = {
intro:'utter_ask_course', 
greet:'utter_greet', 
thanks:'utter_thanks', 
course:'utter_ask_difficulty', 
difficulty:'utter_ask_assignments', 
assignments:'utter_ask_mentors', 
mentors:'utter_ask_lectures', 
lectures:'utter_ask_scale',
scale:'utter_thanks', 
goodbye:'utter_goodbye'}

let getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

let pickReply = function(utter) {
  const val = utters[utter] && Array.isArray(utters[utter]) && 
  utters[utter].length > 0  && utters[utter][getRandomInt(0,utters[utter].length-1)];
  if (!val) {
    return null;
  }
  return val;
};

let sentimentMessage = (intent, message) => {
  console.log('------ start ---------')
  console.log(' NLP: ')
  console.log(message.nlp)
  console.log('------------------------')
  console.log(' message.nlp.entities:')
  console.log(message.nlp.entities)
  
  // TODO
  let confidence = 0.0
  let value='neutral'
  
  try{
    console.log('------------------------')
    if ('sentiment' in message.nlp.entities){
      console.log(' message.nlp.entities.sentiment[0].value:')
      console.log(message.nlp.entities.sentiment[0].value)
      confidence = message.nlp.entities.sentiment[0].confidence
      value = message.nlp.entities.sentiment[0].value
      console.log('sentiment score is:')
      console.log(confidence)
      console.log('sentiment value is:')
      console.log(value)
    }
    
  }
  catch{
    console.error('error getting sentiment')
  }

  let sign = {negative:-1, positive:1, neutral:0}
  let msg = ""
  if (intent === 'lectures'){
    sentiment_scores[intent] = confidence * sign[value]
    console.log('calcualting avg')
    console.log(JSON.stringify(sentiment_scores))
    
    let avg_score = (
    sentiment_scores['difficulty'] + 
    sentiment_scores['assignments'] + 
    sentiment_scores['mentors'] + 
    sentiment_scores['lectures'])/4.0
    console.log(avg_score)
    
    if (avg_score > 0.3)
        msg = "It seems that you like this course very much"
    else if (avg_score >= 0.1)
        msg = "It seems that you like this course"
    else if (avg_score < -0.3)
        msg = "It seems that you don't like this course at all"
    else if (avg_score <= -0.1)
        msg = "It seems that you don't like this course"
    else
        msg = "It seems that you have some likes and dislikes about this course"

  }
  else{
        if (confidence > 0.3 && value === 'positive'){
          msg = sentiment_msgs['goodgood'][getRandomInt(0,sentiment_msgs.goodgood.length-1)]
          sentiment_scores[intent] = confidence * sign[value]  
        }
        else if (confidence >= 0.1 && value === 'positive')
        {
          msg = sentiment_msgs['good'][getRandomInt(0,sentiment_msgs.good.length-1)]
          sentiment_scores[intent] = confidence * sign[value]  
        }
        else if (confidence > 0.3 && value === 'negative')
        {
          msg = sentiment_msgs['badbad'][getRandomInt(0,sentiment_msgs.badbad.length-1)]
          sentiment_scores[intent] = confidence * sign[value]  
        }
        else if (confidence >= 0.1 && value === 'negative'){
          msg = sentiment_msgs['bad'][getRandomInt(0,sentiment_msgs.bad.length-1)]
          sentiment_scores[intent] = confidence * sign[value]  
        }
        
  }
  
  return msg
}

let figureNextAction = (intent,extracted_entities, message)=>{
  console.log('intent is '  + intent)
  console.log('entities are ' + JSON.stringify(extracted_entities))
  console.log('next actioin is ' + next_action[intent])
  let response = pickReply(next_action[intent]);
  
  if (response === null)
    response = 'Will you say that again please, I am not sure I understand :/'
  else{

        for (let e in extracted_entities)
            response = response.replace('{' + e + '}', extracted_entities[e])
 
        console.log('respnose after replaced ' + response)
        
        if (['difficulty', 'assignments', 'mentors', 'lectures'].includes(intent)){
          
          response = sentimentMessage(intent, message) + response
        }
      
        console.log('respnose with sentiment added ' + response)
      }
    return  response
}

module.exports = {figureNextAction:figureNextAction};