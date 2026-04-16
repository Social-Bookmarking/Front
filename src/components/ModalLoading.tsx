const ModalLoading = () => {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-violet-500" />
        <p className="text-sm font-medium text-gray-500">
          페이지를 불러오는 중...
        </p>
      </div>
    </div>
  );
};

export default ModalLoading;
