import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { AlertTriangle } from "lucide-react";
import { Button } from "../ui/button";
import { ConexionApi } from "~/services/conexionApi";
import { useNavigate } from "react-router";
import type { Product } from "~/interfaces/product";

interface ProviderDeleteModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  token?: string;
  currentPage?: number;
}

export default function DeleteProductModal({
  product,
  isOpen,
  onClose,
  token,
  currentPage = 1,
}: ProviderDeleteModalProps) {
  const navigate = useNavigate();
  if (!product) return null;

  const onDelete = async () => {
    try {
      const { data } = await ConexionApi.delete(`/products/${product.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      onClose();

      navigate(`/products?page=${currentPage || 1}`);
    } catch (error) {
      console.error("Error deleting provider:", error);
      // Handle error (e.g., show notification)
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete Provider
          </DialogTitle>
          <DialogDescription className="text-left">
            This action cannot be undone. This will permanently delete the
            provider and remove all associated data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              <strong>Provider to delete:</strong>
            </p>
            <p className="font-semibold text-red-900 mt-1">{product.name}</p>
            <p className="text-sm text-red-700">{product.price}</p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onDelete}>
              Delete Provider
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
