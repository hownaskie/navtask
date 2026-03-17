import { Button, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import SocialButton from "../SocialButton";
import OrDivider from "../OrDivider";
import { FacebookIcon, GoogleIcon } from "../../assets";

interface AuthFooterProps {
  title: string;
  linkLabel: string;
  linkPath: string;
  onGoogle: () => void;
  onFacebook: () => void;
}

const AuthFooter = ({ title, linkLabel, linkPath, onGoogle, onFacebook }: AuthFooterProps) => {
  const navigate = useNavigate();

  return (
    <>
      <Typography
        variant="body2"
        color="text.secondary"
        align="center"
        mt={3}
      >
        {title}{" "}
        <Button
          variant="text"
          size="small"
          onClick={() => navigate(linkPath)}
          sx={{ fontWeight: 700, p: 0, minWidth: "auto" }}
        >
          {linkLabel}
        </Button>
      </Typography>

      <OrDivider text="OR" />

      <Stack direction="column" spacing={1.5} mb={0.5}>
        <SocialButton
          icon={<GoogleIcon />}
          label="Continue with Google"
          onClick={onGoogle}
        />
        <SocialButton
          icon={<FacebookIcon />}
          label="Continue with Facebook"
          onClick={onFacebook}
        />
      </Stack>
    </>
  );
};

export default AuthFooter;
