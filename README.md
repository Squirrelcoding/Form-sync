# Formsync

## Introduction

Formsync is an online platform for clients and fitness coaches to meet and work out together. The most unique feature of the platform will be the real-time form syncing technology. In addition to this feature, the platform will also feature Tinder-like matchmaking for both parties. For example, perhaps one user is young and looking for a calisthenics coach or is an older user seeking general mobility exercises. Leaderboards and other competitive features will be included to foster accountability and provide a sense of community.


## Features

### Real-time form syncing

As the name suggests, this is the most important feature of the platform. The fitness coach and the client will both stand in front of their device's cameras (a mobile phone or a laptop, for example) and proceed to do the exercises. The cameras will record a video feed passed onto the website for processing. 

1. The first stage in processing will be a computer vision model that captures the user's pose and return a collection of coordinates. 
2. The second stage will be normalization to ensure that the two coordinate sets can be fairly compared.
3. The third stage calculates a "similarity" metric from the normalized coordinate sets to measure how "similar" the general forms are. 
    - If the same video feed is fed twice, the similarity should be an extreme value (such as 0 or 1)
    - Should work independent of the users location relative to the camera. That is, the metric should not change dramatically with respect to the users position or orientation.
4. If feasible, the positons should be fed into an LLM to provide interpretable feedback such as "Raise your legs higher."

### Client-coach matching

Users will be able to find coaches and clients throughout the world via a Tinder-like matchmaking algorithm that will be based on preferences and training style. For example, somebody may be looking for a calisthenics coach while a different person is looking for someone to do general mobility exercises with. Additional features may include time, language, or demographics.

### Leaderboards

To encourage accountability and foster a sense of community, users will have the option to create and join leaderboards, ranked by daily streak or time done to exercise.

### Syncing & logging

The platform may be able to connect to external services such as Apple Fitness or MyFitnessPal. The platform will log exercises by itself.

## Development timeline


