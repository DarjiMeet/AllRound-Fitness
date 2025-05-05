import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter , Routes, Route} from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'

import LogIn from './components/Owner/ownerLogin.jsx'
import SignUp from './components/Owner/ownerSignup.jsx'
import OwnerHome from './components/Owner/ownerHome.jsx'

import VerifyEmail from './components/VerifyEmail.jsx'
import CheckAuth from './components/CheckAuth.jsx'
import OwnerGym from './components/Owner/ownerGym.jsx'
import GymTrainer from './components/Owner/gymTrainer.jsx'
import GymMember from './components/Owner/GymMember.jsx'
import GymEvent from './components/Owner/gymEvent.jsx'
import UserLogin from './components/User/userLogin.jsx'
import UserSignup from './components/User/userSignup.jsx'
import UserHome from './components/User/userHome.jsx'
import CheckUserAuth from './components/checkUserAuth.jsx'
import UserGym from './components/User/component/userGym.jsx'
import { GymProvider } from './components/User/userContext.jsx'
import PaymentSuccess from './components/User/component/PaymentSuccess.jsx'
import PaymentFailed from './components/User/component/PaymentFailed.jsx'
import UserMembership from './components/User/userMembership.jsx'
import SingleTrainer from './components/User/component/SingleTrainer.jsx'
import SingleEquip from './components/User/component/SingleEquip.jsx'
import UserEvents from './components/User/userEvents.jsx'
import AIchat from './components/User/Ai_trainer.jsx'
import Messages from './components/User/messages.jsx'
import SingleUserChat from './components/User/component/singleUserChat.jsx'
import UserProfile from './components/User/userProfile.jsx'
import SingleOwnerChat from './components/User/component/singleOwnerChat.jsx'
import MessagesOwner from './components/Owner/messages.jsx'
import SingleUserC from './components/Owner/component/singleUserChat.jsx'
import OwnerChat from './components/Owner/component/SingleOwnerChat.jsx'
import Profile from './components/Owner/ownerProfile.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Toaster position="top-center" reverseOrder={false}/>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/user/signup" element={<UserSignup />} />
        <Route path="/user/login" element={<UserLogin />} />

        <Route path="/user/home" element={
          <CheckUserAuth>
            <GymProvider>
              <UserHome/>
            </GymProvider>
          </CheckUserAuth>
        } />

        <Route path="/user/gym/:gymId" element={
          <CheckUserAuth>
            <GymProvider>
              <UserGym/>
            </GymProvider>
          </CheckUserAuth>
        } />

        <Route path="/user/membership" element={
          <CheckUserAuth>
            <GymProvider>
              <UserMembership/>
            </GymProvider>
          </CheckUserAuth>
        } />

        <Route path="/user/gym/:gymId/trainer/:trainerId" element={
          <CheckUserAuth>
            <GymProvider>
              <SingleTrainer/>
            </GymProvider>
          </CheckUserAuth>
        } />

        <Route path="/user/gym/:gymId/equipment/:equipId" element={
          <CheckUserAuth>
            <GymProvider>
              <SingleEquip/>
            </GymProvider>
          </CheckUserAuth>
        } />

        <Route path="/user/your-events" element={
          <CheckUserAuth>
            <GymProvider>
              <UserEvents/>
            </GymProvider>
          </CheckUserAuth>
        } />

        <Route path="/user/ai-trainer" element={
          <CheckUserAuth>
            <GymProvider>
              <AIchat/>
            </GymProvider>
          </CheckUserAuth>
        } />

        <Route path="/user/messages" element={
          <CheckUserAuth>
            <GymProvider>
              <Messages/>
            </GymProvider>
          </CheckUserAuth>
        } />

        <Route path="/user/profile" element={
          <CheckUserAuth>
            <GymProvider>
              <UserProfile/>
            </GymProvider>
          </CheckUserAuth>
        } />

        <Route path="/user/messages/:userId" element={
          <CheckUserAuth>
            <GymProvider>
              <SingleUserChat/>
            </GymProvider>
          </CheckUserAuth>
        } />

        <Route path="/user/owner/messages/:ownerId" element={
          <CheckUserAuth>
            <GymProvider>
              <SingleOwnerChat/>
            </GymProvider>
          </CheckUserAuth>
        } />
  
        <Route path='/payment-success/:gymId' element={<PaymentSuccess/>}/>
        <Route path='/payment-cancel/:gymId' element={<PaymentFailed/>}/>

        <Route path="/owner/login" element={<LogIn />} />
        <Route path="/owner/signup" element={<SignUp />} />
        <Route path="/owner/home" element={
          <CheckAuth>
            <OwnerHome/>
          </CheckAuth>
        } />
        <Route path="/owner/gym/:gymId" element={
          <CheckAuth>
            <OwnerGym/>
          </CheckAuth>
        } />
   
        <Route path="/owner/gym/:gymId/trainer/:trainerId" element={
          <CheckAuth>
            <GymTrainer/>
          </CheckAuth>
        } />

        <Route path="/owner/gym/:gymId/member/:memberId" element={
          <CheckAuth>
            <GymMember/>
          </CheckAuth>
        } />
   
        <Route path="/owner/gym/:gymId/event/:eventId" element={
          <CheckAuth>
            <GymEvent/>
          </CheckAuth>
        } />

        <Route path="/owner/messages" element={
          <CheckAuth>
            <MessagesOwner/>
          </CheckAuth>
        } />
   
        <Route path="/owner/messages/:userId" element={
          <CheckAuth>
            <SingleUserC/>
          </CheckAuth>
        } />

        <Route path="/owner/user/messages/:ownerId" element={
          <CheckAuth>
            <OwnerChat/>
          </CheckAuth>
        } />
   
        <Route path="/owner/profile" element={
          <CheckAuth>
            <Profile/>
          </CheckAuth>
        } />
   
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
