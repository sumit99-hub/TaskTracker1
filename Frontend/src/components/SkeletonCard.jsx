import { motion } from 'framer-motion';

const SkeletonCard = () => (
  <motion.div 
    animate={{ opacity: [0.5, 1, 0.5] }}
    transition={{ repeat: Infinity, duration: 1.5 }}
    className="bg-gray-200 h-32 w-full rounded-xl mb-4"
  />
);

export default SkeletonCard;