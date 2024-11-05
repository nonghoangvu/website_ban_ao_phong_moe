import { AspectRatio, Card, Typography } from "@mui/joy";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CardShoppingCard({ data }) {
  const [flexBasis, setFlexBasis] = useState(200);
  const navigate = useNavigate();
  return (
    <Card
      variant="plain"
      size="sm"
      orientation="horizontal"
      sx={{ gap: 2, minWidth: 350 }}
    >
      <AspectRatio
        sx={[
          { overflow: "auto" },
          flexBasis ? { flexBasis: `${flexBasis}px` } : { flexBasis: null },
        ]}
      >
        <img src={data.imageUrl} alt={data.name} />
      </AspectRatio>
      <div style={{ width: "100%" }}>
        <Typography level="title-sm" noWrap={false} color={!data.validProduct.status ? "danger" : "neutral"}>
          {data.name}
        </Typography>
        <Typography
          level="body-sm"
          color={!data.validProduct.status ? "danger" : "neutral"}
        >
          {!data.validProduct.status ? "Sản phẩm không tồn tại" : data.origin}
        </Typography>
      </div>
    </Card>
  );
}

export default CardShoppingCard;
