import React, { forwardRef, useImperativeHandle } from "react";

import {
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Typography,
} from "@mui/material";
import ArMenuRadix from "@/components/arMenuRadix";

const Slider = forwardRef(
  (
    {
      currentSelectMenu,
      handleCurrentSelectMenu,
      setNewDialogOpen,
      setUploadDialogOpen,
      setGithubDialogOpen,
    },
    ref
  ) => {
    const getMainMenuTitleViaId = (id) => {
      return mainMenuList.find((item) => item.id === id)?.title;
    };

    useImperativeHandle(ref, () => ({
      getMainMenuTitleViaId,
    }));

    const mainMenuList = [
      {
        id: 1,
        title: "All Projects",
      },
      {
        id: 2,
        title: "Your Projects",
      },
      {
        id: 3,
        title: "Shared with you",
      },
    ];

    const organizeMenuList = [
      {
        id: "New Tag",
        title: "New Tag",
        onClick: () => { },
      },
      {
        id: "tag",
        title: "tag",
        onClick: () => { },
      },
      {
        id: "Uncategorized",
        title: "Uncategorized",
        onClick: () => { },
      },
    ];

    return (
      <Box
        display="flex"
        flexDirection="column"
        width={256}
        bgcolor="background.default"
        boxShadow={3}
        className="h-full"
      >
        <Box px={2} pb={1} pt={2}>
          <ArMenuRadix
            isNeedIcon={false}
            align="left"
            buttonClassName={
              "bg-arxTheme hover:bg-arx-theme-hover text-[1.1rem] text-white font-bold py-2 shadow-xl rounded-[0.4rem] border border-arxTheme"
            }
            title={"New Project"}
            items={[
              {
                label: "New Project",
                onSelect: () => setNewDialogOpen(true),
              },
              {
                label: "Upload Project",
                onSelect: () => setUploadDialogOpen(true),
              },
              {
                label: "Import From GitHub",
                onSelect: () => setGithubDialogOpen(true),
              },
              // {
              //   label: "Templates",
              //   separator: true,
              //   subMenu: [
              //     {
              //       label: "Academic Journal",
              //       onSelect: () => console.log("Academic Journal"),
              //     },
              //     {
              //       label: "Book",
              //       onSelect: () => console.log("Book"),
              //     },
              //   ],
              // },
            ]}
          ></ArMenuRadix>

        </Box>
        <nav className="overflow-auto">
          <List className="py-1">
            {mainMenuList.map((item) => {
              return (
                <ListItem
                  button
                  component="a"
                  key={item.id}
                  className={`py-[4px] ${currentSelectMenu === item.id && "bg-[#8776762e]"
                    }`}
                  onClick={() => handleCurrentSelectMenu(item.id)}
                >
                  <ListItemText
                    primary={item.title}
                    sx={{
                      padding: "0 10px",
                      "& .MuiTypography-root": {
                        fontSize: "16px",
                      },
                    }}
                  />
                </ListItem>
              );
            })}
            {/* <Divider />
                    <Typography variant="subtitle2" sx={{ my: 2, mx: 2 }}>
                        ORGANIZE PROJECTS
                    </Typography>
                    {organizeMenuList.map(item => {
                        return <ListItem button component="a"  key={item.id}>
                            <ListItemText primary={item.title} onClick={item.onClick} />
                        </ListItem>
                    })}

                    <Divider />
                    <Typography variant="subtitle2" sx={{ my: 2, mx: 2 }}>
                        Are you affiliated with an institution?
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
                        <Button variant="outlined" size="small">
                            Add Affiliation
                        </Button>
                    </Box> */}
          </List>
        </nav>
      </Box>
    );
  }
);

export default Slider;
