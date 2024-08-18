import React, { useState } from 'react';
import styled from 'styled-components';
import { colors } from '../theme/theme';
const TabsWrapper = styled.div`
  display: flex;
  overflow-x: auto; /* Enable horizontal scrolling */
  border-bottom: 2px solid #e0e0e0; /* Light grey border for the tab container */
  width: ${props => props.width};
  scrollbar-width: thin; /* Firefox scrollbar */
  &::-webkit-scrollbar {
    height: 6px; /* Height of the scrollbar */
  }
  &::-webkit-scrollbar-thumb {
    background-color: #ccc; /* Color of the scrollbar thumb */
    border-radius: 10px; /* Round scrollbar edges */
  }
`;

const Tab = styled.button`
  background: none;
  border: none;
  color: ${props => (props.isActive ? `${colors.Orange}` : '#6c757d')}; /* Red color for active tab, grey for inactive */
  padding: 12px 16px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: ${props => (props.isActive ? 'bold' : 'normal')};
  position: relative;
  outline: none;
  white-space: nowrap; /* Prevent text wrapping */

  &:hover {
    color: ${props => ( `${colors.Orange}`)}; 
  }

  &::after {
    content: '';
    display: ${props => (props.isActive ? 'block' : 'none')};
    height: 2px;
    background-color: #ff0000; /* Red underline for active tab */
    position: absolute;
    bottom: -2px;
    left: 0;
    right: 0;
  }
`;

const TabPanel = styled.div`
  padding: 8px;
  margin-top: 8px;
`;

const MenuTab = ({ tabs, width, onTabSelect }) => {
  const [activeTab, setActiveTab] = useState(tabs[0].label);

  const handleTabClick = (tab) => {
    setActiveTab(tab.label);
    onTabSelect(tab.label); // Call the callback to handle filtering
  };

  return (
    <div>
      <TabsWrapper width={width}>
        {tabs.map((tab) => (
          <Tab
            key={tab.label}
            isActive={activeTab === tab.label}
            onClick={() => handleTabClick(tab)}
          >
            {tab.label}
          </Tab>
        ))}
      </TabsWrapper>
      <TabPanel>
        {tabs.map((tab) =>
          activeTab === tab.label ? tab.content : null
        )}
      </TabPanel>
    </div>
  );
};

export default MenuTab;
