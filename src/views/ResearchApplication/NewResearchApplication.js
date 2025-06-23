import React from 'react'
import MainContainer from '../../components/Layout/MainContainer'
import ApplicationForm from './component/ApplicationForm'

function NewResearchApplication() {
  return (
    <MainContainer activeHeader={'Research Proposal'}>
      <ApplicationForm />
    </MainContainer>
  )
}

export default NewResearchApplication