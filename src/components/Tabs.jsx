// src/components/Tabs.js
import React, { useState } from 'react';
import styled from 'styled-components';

const TabsWrapper = styled.div`
  display: flex;
  border-bottom: 2px solid #e0e0e0; /* Light grey border for the tab container */
  width: ${props => (props.width)};
`;

const Tab = styled.button`
  background: none;
  border: none;
  color: ${props => (props.isActive ? '#007bff' : '#6c757d')}; /* Primary color for active tab, grey for inactive */
  padding: 12px 16px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: ${props => (props.isActive ? 'bold' : 'normal')};
  position: relative;
  outline: none;

  &:hover {
    color: #0056b3; /* Slightly darker blue on hover */
  }

  &::after {
    content: '';
    display: ${props => (props.isActive ? 'block' : 'none')};
    height: 2px;
    background-color: #007bff; /* Blue underline for active tab */
    position: absolute;
    bottom: -2px;
    left: 0;
    right: 0;
  }
`;

const TabPanel = styled.div`
  padding: 16px;
  margin-top: 8px;
`;

const Tabs = ({ tabs, width }) => {
  const [activeTab, setActiveTab] = useState(tabs[0].label);

  return (
    <div>
      <TabsWrapper width={width}>
        {tabs.map((tab) => (
          <Tab
            key={tab.label}
            isActive={activeTab === tab.label}
            onClick={() => setActiveTab(tab.label)}
          >
            {tab.label}
          </Tab>
        ))}
      </TabsWrapper>
      <TabPanel>
        {tabs.map((tab) => (
          activeTab === tab.label ? tab.content : null
        ))}
      </TabPanel>
    </div>
  );
};

export default Tabs;
