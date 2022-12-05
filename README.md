<img width="1023" alt="Screen Shot 2022-12-05 at 09 03 28" src="https://user-images.githubusercontent.com/8307131/205669985-391fbd06-8ad2-49ed-931b-0a6ef787ea9b.png">


# Petri Net WebGme MiniProject
## _For CS 6388 at Vanderbilt University_

# ⚙️  Useful tool and knowledge for exploration
- [Home Brew](https://brew.sh/)
- [NVM](https://github.com/nvm-sh/nvm)
- [MongoDB](https://www.mongodb.com/)
- [NPM](https://www.npmjs.com/)
- [Webgme](https://github.com/webgme/webgme-cli)

# 🧠 Domain
A Petri net, also known as a place/transition (PT) net, is one of several mathematical modeling languages for the description of distributed systems. It is a class of discrete event dynamic system. A Petri net is a directed bipartite graph that has two types of elements, places and transitions. Place elements are depicted as white circles and transition elements are depicted as rectangles. A place can contain any number of tokens, depicted as black circles. A transition is enabled if all places connected to it as inputs contain at least one token [Wikipedia](https://en.wikipedia.org/wiki/Petri_net#:~:text=A%20Petri%20net%2C%20also%20known,of%20elements%2C%20places%20and%20transitions.)

### Real world example: 

PetriNet has also been used in manufactoring layout and even vending machine flow chart. 

In the base `StateMachine` Seed, I have display using petrinet to display the 4 seasons of the year

<img width="1023" alt="Screen Shot 2022-12-05 at 09 03 28" src="https://user-images.githubusercontent.com/8307131/205670053-8ab64565-b741-4805-bc8d-23f6eb48b9f5.png">

# 🔧 Installation
### 1. Clone the repository. 
### 2. Install NVM `nvm install 18 && nvm use 18`
### 3. Navidate to `Petri` folder
### 4. Start Mongo db by `brew services start mongodb-community@4.4`
### 5. Start your project by `npm start`
### 6. Navigate to `http://localhost:8888/` from your browser
### 7. Happy developing ! 😀 

# 📕 Usage Instruction : Modeling PetriNet
### 1. Use `StateMachine` seed as your base project
<img width="665" alt="Screen Shot 2022-12-04 at 14 17 58" src="https://user-images.githubusercontent.com/8307131/205513493-01824cad-ed33-4553-890d-4dec0d083359.png">

### 2. Drag PetriNet component on the Left side to build your model
<img width="1440" alt="Screen Shot 2022-12-05 at 08 39 43" src="https://user-images.githubusercontent.com/8307131/205664944-cf034450-a6a8-425b-8093-c380761b425f.png">

### 3. Open up Component tab on the left side 
<img width="1206" alt="Screen Shot 2022-12-05 at 08 04 30" src="https://user-images.githubusercontent.com/8307131/205656511-ac284d2f-aafb-48f7-8d83-a6ebbbaf2596.png">

### 4. Edit the Dot inside the place, Click on the attribute tab inside the 'Property Editor'
<img width="1440" alt="Screen Shot 2022-12-05 at 08 39 43" src="https://user-images.githubusercontent.com/8307131/205664534-3ae20917-d702-46ef-b025-37a29bcdc248.png">

### 5. Click on the Marks attribute the edit the dots in side place
<img width="1440" alt="Screen Shot 2022-12-05 at 08 39 43" src="https://user-images.githubusercontent.com/8307131/205664743-0905f249-228c-4fd4-8fda-5bc63aef9e6b.png">

### 4. Happy Modeling !😀 
https://user-images.githubusercontent.com/8307131/205665470-5b35412b-90ba-48c0-9074-c31f155a1806.mov

# 📗 Usage Instruction : PetriNet Simulating
### 1. Navigate to `SimSM` tab on the left side
<img width="1440" alt="Screen Shot 2022-12-05 at 08 55 41" src="https://user-images.githubusercontent.com/8307131/205668443-6d2ef05d-21ba-4cec-985e-ed26f59a3339.png">

### 2. Click on Top Left Button to start the simulator of specific place
<img width="1440" alt="Screen Shot 2022-12-05 at 08 55 41" src="https://user-images.githubusercontent.com/8307131/205668609-b25ae487-fbb9-410d-ae59-165f5777c02b.png">


### 3. Notice the Notification on Bottom Left to see if the PetriNEt is either `Free Choice PetriNet` , `StateMachine`, `Marked Graph`, `WorkFlow`, The Notification bar will also tell you you have reached a `Deadlock` if your petri net is in a `DeadLock`
![sim](https://user-images.githubusercontent.com/8307131/205513890-c435663a-6957-4e48-a00f-e47ad3113624.png)

### 4. You can also click <img width="1440" alt="Screen Shot 2022-12-05 at 08 55 41" src="https://user-images.githubusercontent.com/8307131/205668744-6ab3d033-b517-47de-9c1b-7fb8343081d3.png">
on the `Reset` button on top left to reset the petrinet to it's original state


### 4. Happy simulating !😀 


https://user-images.githubusercontent.com/8307131/205669457-1f448078-0b69-4515-92ae-5dfcd6994fc4.mov



# 📌 Note
* This project is base on the StateMachine [example project](https://github.com/kecso/StateMachineJoint)
* Since I am new to Javascript development, many of the UI components are reference from other Sample projects. I have added some comment in the codes for reference. 
* The project has build on the `webgme-cli` tool instead of Docker.

# 📋 Reference 
[WebGme Documentation](https://webgme.readthedocs.io/_/downloads/en/latest/pdf/)
[WebGme Tutorial](https://www.youtube.com/watch?v=Ri4IC_u-TO4&list=PLhvSjgKmeyjhp4_hnf-xPdCgES56dnMJb&index=5&ab_channel=WebGME)
[Sample Project](https://github.com/CleverPaul/PetriNetDesignStudio)
[Sample Project](https://github.com/austinjhunt/petrinet-webgme-designstudio)



