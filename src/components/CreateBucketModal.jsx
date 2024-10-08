import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from 'lucide-react';

const CreateBucketModal = ({ isOpen, onClose, onConfirm }) => {
  const [bucketName, setBucketName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await onConfirm(bucketName);
      setBucketName('');
      onClose();
    } catch (error) {
      console.error('Error creating bucket:', error);
      setError(error.message || 'Failed to create bucket. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Bucket</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bucketName" className="text-right">
                Bucket Name
              </Label>
              <Input
                id="bucketName"
                value={bucketName}
                onChange={(e) => setBucketName(e.target.value)}
                className="col-span-3"
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading || !bucketName.trim()}>
              {isLoading ? 'Creating...' : 'Create Bucket'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBucketModal;
