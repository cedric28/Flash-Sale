import React, { useState, useEffect } from "react";
import {
  getSaleStatus,
  attemptPurchase,
  getUserPurchaseStatus,
  SaleStatus,
  getUserPurchases,
} from "./services/FlashSaleService";
import { prettifySaleStatus } from "./utils/prettifySaleStatus";
import en from "./locale/en";
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Box,
  CircularProgress,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

export default function App() {
  const [status, setStatus] = useState<SaleStatus>("upcoming");
  const [userId, setUserId] = useState("");
  const [result, setResult] = useState("");
  const [hasPurchased, setHasPurchased] = useState<boolean | null>(null);
  const [userPurchases, setUserPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      setLoading(true);
      setStatus(await getSaleStatus());
      setLoading(false);
    };
    fetchStatus();
  }, []);

  const handlePurchase = async () => {
    setLoading(true);
    const res = await attemptPurchase(userId);
    setResult(res.message);
    setLoading(false);
    handleCheckPurchase();
  };

  const handleCheckPurchase = async () => {
    setLoading(true);
    const purchased = await getUserPurchaseStatus(userId);
    setHasPurchased(purchased);
    const purchases = await getUserPurchases(userId);
    setUserPurchases(purchases);
    setLoading(false);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Card elevation={4} sx={{ borderRadius: 4 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <ShoppingCartIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
            <Typography variant="h4" fontWeight={700} color="primary">
              {en.title}
            </Typography>
          </Box>
          <Typography variant="subtitle1" gutterBottom>
            {en.status}:{" "}
            <span
              style={{
                color:
                  status === "active"
                    ? "green"
                    : status === "ended"
                    ? "red"
                    : "orange",
                fontWeight: 600,
              }}
            >
              {prettifySaleStatus(status, en)}
            </span>
          </Typography>
          <TextField
            label={en.userIdLabel}
            variant="outlined"
            fullWidth
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={!userId || status !== "active" || loading}
            onClick={handlePurchase}
            sx={{ mb: 2 }}
          >
            {en.buy}
          </Button>
          {result && (
            <Alert
              severity={result.includes("successful") ? "success" : "warning"}
              sx={{ mb: 2 }}
            >
              {result}
            </Alert>
          )}
          <Button
            variant="outlined"
            color="secondary"
            fullWidth
            size="large"
            disabled={!userId || loading}
            onClick={handleCheckPurchase}
            sx={{ mb: 2 }}
          >
            {en.checkPurchase}
          </Button>
          {hasPurchased !== null && (
            <Alert severity={hasPurchased ? "success" : "info"}>
              {hasPurchased ? en.success : en.noPurchase}
            </Alert>
          )}
          {userPurchases.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Purchased Items:</Typography>
              <ul>
                {userPurchases.map((purchase) => (
                  <li key={purchase.id}>
                    {purchase.Product?.name} (Purchased at:{" "}
                    {new Date(purchase.createdAt).toLocaleString()})
                  </li>
                ))}
              </ul>
            </Box>
          )}
          {loading && (
            <Box display="flex" justifyContent="center" mt={2}>
              <CircularProgress />
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
