/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-02-01 15:43:12
 */
import { useCallback, useState } from "react";

import { IconButton } from "@atlaskit/button/new";
import MoreIcon from "@atlaskit/icon/glyph/more";
import { ButtonItem, LinkItem, PopupMenuGroup, Section } from "@atlaskit/menu";
import Popup from "@atlaskit/popup";
import {
  Header,
  NavigationHeader,
  NestableNavigationContent,
  SideNavigation,
} from "@atlaskit/side-navigation";

import {
  Content,
  LeftSidebar,
  Main,
  PageLayout,
  RightSidebar,
  useLeftSidebarFlyoutLock,
} from "@atlaskit/page-layout";
// import GitTest from "../git-test";

import Tooltip from "@atlaskit/tooltip";

const PopupMenu = ({ closePopupMenu }) => {
  useLeftSidebarFlyoutLock();
  return (
    <PopupMenuGroup>
      <Section title="Starred">
        <ButtonItem onClick={closePopupMenu}>Navigation System</ButtonItem>
      </Section>
      <Section hasSeparator>
        <ButtonItem onClick={closePopupMenu}>Create project</ButtonItem>
      </Section>
    </PopupMenuGroup>
  );
};

const Menu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const closePopupMenu = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  return (
    <Popup
      placement="bottom-start"
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      content={() => <PopupMenu closePopupMenu={closePopupMenu} />}
      trigger={(triggerProps) => (
        <IconButton
          {...triggerProps}
          testId="popup-trigger"
          isSelected={isOpen}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          icon={MoreIcon}
          label="more"
        />
      )}
    />
  );
};

const ResizeSlider = ({ children }) => {
  return (
    <PageLayout>
      <Content>
        <LeftSidebar
          width={300}
          testId="left-sidebar"
          data-testid="css-reset"
          className="bg-[red]"
          xcss={{ background: "red" }}
          isFixed={false}
          overrides={{
            ResizeButton: {
              render: (Component, props) => (
                <Tooltip
                  content={props.isLeftSidebarCollapsed ? "Expand" : "Collapse"}
                  hideTooltipOnClick
                  position="right"
                  testId="tooltip"
                >
                  <Component {...props} style={{ top: "50%" }} />
                </Tooltip>
              ),
            },
          }}
        >
          <SideNavigation label="Project navigation" testId="side-navigation">
            {/* <GitTest></GitTest> */}
          </SideNavigation>
        </LeftSidebar>
        <Main className="ml-2"> {children}</Main>
        {/* <RightSidebar testId="right-sidebar">
          <SideNavigation label="Aside">
            <NavigationHeader>
              <Header>Hello world</Header>
            </NavigationHeader>
          </SideNavigation>
        </RightSidebar> */}
      </Content>
    </PageLayout>
  );
};

const ResizeRightSlider = ({ children }) => {
  return (
    <RightSidebar
      width={"100%"}
      style={{ display: "flex", flexDirection: "row-reverse" }}
      testId="right-sidebar"
      data-testid="css-reset"
      className="bg-[red]"
      xcss={{ background: "red" }}
      isFixed={false}
      overrides={{
        ResizeButton: {
          render: (Component, props) => (
            <Tooltip
              content={props.isRightSidebarCollapsed ? "Expand" : "Collapse"}
              hideTooltipOnClick
              position="left"
              testId="tooltip"
            >
              <Component {...props} style={{ top: "50%" }} />
            </Tooltip>
          ),
        },
      }}
    >
      {children}
    </RightSidebar>
  );
};

export { ResizeSlider, ResizeRightSlider };
