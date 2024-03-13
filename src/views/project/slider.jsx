import React, { forwardRef, useImperativeHandle } from "react";
import ArMenu from "@/components/arMenu";

import {
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Typography,
} from "@mui/material";

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
        onClick: () => {},
      },
      {
        id: "tag",
        title: "tag",
        onClick: () => {},
      },
      {
        id: "Uncategorized",
        title: "Uncategorized",
        onClick: () => {},
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
          <ArMenu
            buttonLabel="New Project"
            buttonProps={{
              size: "middle",
              className: `w-full rounded-full`,
            }}
            menuList={[
              {
                label: "New Project",
                onClick: () => setNewDialogOpen(true),
              },
              {
                label: "Upload Project",
                onClick: () => setUploadDialogOpen(true),
              },
              {
                label: "Import From GitHub",
                onClick: () => setGithubDialogOpen(true),
              },
            ]}
            // templateItems={{
            //   title: "Templates",
            //   items: [
            //     {
            //       label: "Academic Journal",
            //       onClick: () => console.log("Academic Journal clicked"),
            //     },
            //     { label: "Book", onClick: () => console.log("Book clicked") },
            //   ],
            // }}
          />
        </Box>
        <nav className="overflow-auto">
          <List className="py-1">
            {mainMenuList.map((item) => {
              return (
                <ListItem
                  button
                  component="a"
                  key={item.id}
                  className={`py-[4px] ${
                    currentSelectMenu === item.id && "bg-[#8776762e]"
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
