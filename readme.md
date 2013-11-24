
FlashCarp
===========================

A proof-of-concept project to explore a flashcard system for knowledge that are more complex than a single answer to a single question.

*Still in progress!*

Features
--------
####Add multiple answers to one topic/question.
Example Use Case:
```
What are the first 10 amendments to the United States Constitution?

1) Freedom of Speech, Press, Religion and Petition
2) Right to keep and bear arms
3) Conditions for quarters of soldiers
4) Right of search and seizure regulated
5) Provisons concerning prosecution
6) Right to a speedy trial, witnesses, etc.
7) Right to a trial by jury
8) Excessive bail, cruel punishment
9) Rule of construction of Constitution
10) Rights of the States under Constitution

```


####Review cards and selectively filter answer types to study.
Example Use Case:
```
Assume that a user has a cardset about historical events with the following type of answers:
- date
- location
- description of event
- historical impact

If the user want to focus on studying just the dates and locations, then they 
should be able to select for these specific filters and narrow their study focus.
```

####Review cards backward from answers.
Example Use Case:
```
Using the same cardset about historical events from above, let's say the user wants to study
the name of the historical event (the front of the card) when given the location and date 
(from the back of the card).

The user should be able to toggle the type of answers (in this case, location and date) to 
study backward from.

Q: What historical event occurred on the date "July 20, 1969" and at the location "Moon"?
A: Apollo 11 landed a man on the Moon

```


TODO
----
- Improve editing UX
- Add collections for cardsets
- Add grade report and statistics for correct/incorrect answers
- Add extra rounds for reviewing incorrect answers
