

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


const Slider = ({ setNewDialogOpen, setUploadDialogOpen, setGithubDialogOpen }) => {

    const mainMenuList = [
        {
            id: "All Projects",
            title: "All Projects",
            onClick: () => { },
        },
        {
            id: "Your Projects",
            title: "Your Projects",
            onClick: () => { },
        },
        {
            id: "Shared with you",
            title: "Shared with you",
            onClick: () => { },
        },
    ]

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

    ]


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
                        className: `w-full rounded-full`
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
                        return <ListItem button component="a" key={item.id} className="py-[4px]">
                            <ListItemText primary={item.title} onClick={item.onClick}
                                sx={{
                                    padding: "0 10px",
                                    "& .MuiTypography-root": {
                                        fontSize: "18px",
                                    }
                                }}
                            />
                        </ListItem>
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
    )
}

export default Slider