import React from 'react'
import MainContainer from '../../components/Layout/MainContainer'
import ResearchTable from './ResearchTable'

function Research() {
  return (
    <MainContainer activeHeader={'Research Proposal'}>
      <ResearchTable />
    </MainContainer>
  )
}

export default Research