import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { FileText, DollarSign, Tag } from "lucide-react";

import { Button } from "../ui/button";
import type { Product } from "~/interfaces/product";

interface ViewProductProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ViewProductModal({
  product = null,
  isOpen,
  onClose,
}: ViewProductProps) {
  if (!product) {
    return null;
  }

  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Product Details
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Header Section */}
          <div className="border-b pb-4">
            <h3 className="text-xl font-semibold text-primary">
              {product.name}
            </h3>
          </div>

          {/* Product Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Product Information</h4>

              <div className="flex items-center space-x-3">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="font-medium text-lg text-green-600">
                    {formatPrice(product.price)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Tag className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Slug</p>
                  <p className="font-medium font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {product.slug}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Description</h4>
              <div className="flex items-start space-x-3">
                <FileText className="h-5 w-5 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground">About</p>
                  <p className="font-medium leading-relaxed">
                    {product.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
