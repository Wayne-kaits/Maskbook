import { FC, memo } from 'react'
import { LinearProgress, linearProgressClasses, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { formatFileSize } from '@masknet/kit'
import { FileBaseProps, FileFrame } from './FileFrame.js'

const useStyles = makeStyles()((theme) => ({
    desc: {
        color: theme.palette.maskColor.second,
        fontWeight: 700,
        fontSize: 12,
        marginTop: 7,
    },
    progressBar: {
        height: 4,
        marginTop: 7,
        borderRadius: 2,
        [`&.${linearProgressClasses.colorPrimary}`]: {
            backgroundColor: theme.palette.maskColor.thirdMain,
        },
        [`& .${linearProgressClasses.bar}`]: {
            borderRadius: 2,
            backgroundColor: theme.palette.maskColor.success,
        },
    },
}))

export interface UploadingFileProps extends FileBaseProps {
    progress?: number
}

export const UploadingFile: FC<UploadingFileProps> = memo(({ file, progress, ...rest }) => {
    const { classes } = useStyles()

    return (
        <FileFrame file={file} {...rest}>
            <LinearProgress
                className={classes.progressBar}
                variant={progress === 0 ? 'indeterminate' : 'determinate'}
                value={progress}
            />
            <Typography className={classes.desc}>{formatFileSize(file.size, true)}</Typography>
        </FileFrame>
    )
})

UploadingFile.displayName = 'UploadingFile'
