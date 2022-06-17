import { SvgIconProps, SvgIcon } from '@mui/material'

const svg = (
    <svg viewBox="0 0 280 280">
        <g id="debank-icon" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
            <rect id="Rectangle" fill="#FE815F" x="0" y="0" />
            <g id="Group" transform="translate(64.000000, 54.000000)">
                <path
                    d="M151.193168,120.312866 C151.193168,148.790135 127.761499,171.875522 98.8570713,171.875522 L2.20006371e-12,171.875522 L2.20006371e-12,137.500418 L98.8570713,137.500418 C108.491881,137.500418 116.302437,129.805289 116.302437,120.312866 C116.302437,110.820443 108.491881,103.125313 98.8570713,103.125313 L63.9663403,103.125313 L63.9663403,68.750209 L98.8570713,68.750209 C108.491881,68.750209 116.302437,61.0550797 116.302437,51.5626567 C116.302437,42.0702337 108.491881,34.3751045 98.8570713,34.3751045 L2.20006371e-12,34.3751045 L2.20006371e-12,6.58674097e-11 L98.8570713,6.58674097e-11 C127.761499,6.58674097e-11 151.193168,23.0853878 151.193168,51.5626567 C151.193168,64.7687888 146.154012,76.8153563 137.866767,85.9377612 C146.154012,95.0601662 151.193168,107.106734 151.193168,120.312866 Z"
                    id="Path"
                    fill="#FFFFFF"
                    opacity="0.800000012"
                />
                <path
                    d="M1.15287181e-13,137.500418 L84.9080189,137.500418 C66.8724097,158.373784 38.1575538,171.875522 5.81512184,171.875522 C3.86301572,171.875522 1.92412492,171.826335 1.15287181e-13,171.729309 L1.15287181e-13,137.500418 L1.15287181e-13,137.500418 Z M102.694694,103.125313 L69.7814621,103.125313 L69.7814621,68.750209 L102.694694,68.750209 C103.991458,74.303678 104.672193,80.0516117 104.672193,85.9377612 C104.672193,91.8239107 103.991458,97.5718445 102.694694,103.125313 Z M84.9080189,34.3751045 L6.26148185e-12,34.3751045 L6.26148185e-12,0.146213381 C1.92412492,0.0491870968 3.86301572,0 5.81512184,0 C38.1575538,0 66.8724097,13.5017383 84.9080189,34.3751045 L84.9080189,34.3751045 Z"
                    id="Shape"
                    fill="#000000"
                    fillRule="nonzero"
                    opacity="0.119999997"
                />
                <path
                    d="M2.00791841e-12,6.59442678e-11 C48.1740467,6.59442678e-11 87.2268276,38.4756463 87.2268276,85.9377612 C87.2268276,133.399876 48.1740467,171.875522 2.00791841e-12,171.875522 L2.00791841e-12,137.500418 C28.904428,137.500418 52.3360966,114.41503 52.3360966,85.9377612 C52.3360966,57.4604923 28.904428,34.3751045 2.00791841e-12,34.3751045 L2.00791841e-12,6.59442678e-11 Z"
                    id="Path"
                    fill="#FFFFFF"
                    fillRule="nonzero"
                />
            </g>
        </g>
    </svg>
)

export function DebankIcon(props: SvgIconProps) {
    return <SvgIcon {...props}>{svg}</SvgIcon>
}
