import {configureStore, createAction, createReducer} from '@reduxjs/toolkit'

const intialState = {
    isAgreedTerms: false,
    isAgreedAgeVerification: false
}

const socketId = {
    id: ''
}
const isSteaming = {
    yes: false
}

const intialInterest = {
    context: ""
}

const markagreed = createAction('markagreed');
const updatesocketid = createAction('updatesocketid')
const isStreamingAction = createAction('isStreaming');
const interestAction = createAction('interest-context')
const updateInitial = createReducer(intialState, base => {
    base.addCase(markagreed, function (state,action){
        for(let key in state){
            state[key] = action.payload[key];
        }
    })
})
const updateSocketId = createReducer(socketId, base => {
    base.addCase(updatesocketid, function (state, action) {
        state.id = action.payload;
    })
})

const updateInterest = createReducer(intialInterest, base => {
    base.addCase(interestAction, function (state, action){
        state.context = action.payload.context;
    })
})

const updateIsStreaming = createReducer(isSteaming, base => {
    base.addCase(isStreamingAction, function (state, action){
        state.yes = action.payload.yes;
    })
})

const store = configureStore({
    reducer: {
        updateInitial,updateSocketId,updateIsStreaming,updateInterest
    }
})


export default store;