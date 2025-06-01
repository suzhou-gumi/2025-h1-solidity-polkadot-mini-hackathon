export const NFTMarketplace = {
  address: '0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1',
  abi: [
    {
      type: 'constructor',
      inputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'approve',
      inputs: [
        {
          name: 'to',
          type: 'address',
          internalType: 'address',
        },
        {
          name: 'tokenId',
          type: 'uint256',
          internalType: 'uint256',
        },
      ],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'balanceOf',
      inputs: [
        {
          name: 'owner',
          type: 'address',
          internalType: 'address',
        },
      ],
      outputs: [
        {
          name: '',
          type: 'uint256',
          internalType: 'uint256',
        },
      ],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'createMarketItem',
      inputs: [
        {
          name: 'price',
          type: 'uint256',
          internalType: 'uint256',
        },
        {
          name: 'tokenURI',
          type: 'string',
          internalType: 'string',
        },
      ],
      outputs: [],
      stateMutability: 'payable',
    },
    {
      type: 'function',
      name: 'getAllSellingList',
      inputs: [],
      outputs: [
        {
          name: '',
          type: 'tuple[]',
          internalType: 'struct NFTMarketplace.MarketItem[]',
          components: [
            {
              name: 'tokenId',
              type: 'uint256',
              internalType: 'uint256',
            },
            {
              name: 'price',
              type: 'uint256',
              internalType: 'uint256',
            },
            {
              name: 'seller',
              type: 'address',
              internalType: 'address payable',
            },
            {
              name: 'owner',
              type: 'address',
              internalType: 'address payable',
            },
            {
              name: 'sold',
              type: 'bool',
              internalType: 'bool',
            },
          ],
        },
      ],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'getApproved',
      inputs: [
        {
          name: 'tokenId',
          type: 'uint256',
          internalType: 'uint256',
        },
      ],
      outputs: [
        {
          name: '',
          type: 'address',
          internalType: 'address',
        },
      ],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'getListingFee',
      inputs: [],
      outputs: [
        {
          name: '',
          type: 'uint256',
          internalType: 'uint256',
        },
      ],
      stateMutability: 'pure',
    },
    {
      type: 'function',
      name: 'getMarketItem',
      inputs: [
        {
          name: 'tokenId',
          type: 'uint256',
          internalType: 'uint256',
        },
      ],
      outputs: [
        {
          name: '',
          type: 'tuple',
          internalType: 'struct NFTMarketplace.MarketItem',
          components: [
            {
              name: 'tokenId',
              type: 'uint256',
              internalType: 'uint256',
            },
            {
              name: 'price',
              type: 'uint256',
              internalType: 'uint256',
            },
            {
              name: 'seller',
              type: 'address',
              internalType: 'address payable',
            },
            {
              name: 'owner',
              type: 'address',
              internalType: 'address payable',
            },
            {
              name: 'sold',
              type: 'bool',
              internalType: 'bool',
            },
          ],
        },
      ],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'getNFTsByOwner',
      inputs: [
        {
          name: 'owner',
          type: 'address',
          internalType: 'address',
        },
      ],
      outputs: [
        {
          name: '',
          type: 'tuple[]',
          internalType: 'struct NFTMarketplace.MarketItem[]',
          components: [
            {
              name: 'tokenId',
              type: 'uint256',
              internalType: 'uint256',
            },
            {
              name: 'price',
              type: 'uint256',
              internalType: 'uint256',
            },
            {
              name: 'seller',
              type: 'address',
              internalType: 'address payable',
            },
            {
              name: 'owner',
              type: 'address',
              internalType: 'address payable',
            },
            {
              name: 'sold',
              type: 'bool',
              internalType: 'bool',
            },
          ],
        },
      ],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'getSellingListBySeller',
      inputs: [
        {
          name: 'seller',
          type: 'address',
          internalType: 'address',
        },
      ],
      outputs: [
        {
          name: '',
          type: 'tuple[]',
          internalType: 'struct NFTMarketplace.MarketItem[]',
          components: [
            {
              name: 'tokenId',
              type: 'uint256',
              internalType: 'uint256',
            },
            {
              name: 'price',
              type: 'uint256',
              internalType: 'uint256',
            },
            {
              name: 'seller',
              type: 'address',
              internalType: 'address payable',
            },
            {
              name: 'owner',
              type: 'address',
              internalType: 'address payable',
            },
            {
              name: 'sold',
              type: 'bool',
              internalType: 'bool',
            },
          ],
        },
      ],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'isApprovedForAll',
      inputs: [
        {
          name: 'owner',
          type: 'address',
          internalType: 'address',
        },
        {
          name: 'operator',
          type: 'address',
          internalType: 'address',
        },
      ],
      outputs: [
        {
          name: '',
          type: 'bool',
          internalType: 'bool',
        },
      ],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'name',
      inputs: [],
      outputs: [
        {
          name: '',
          type: 'string',
          internalType: 'string',
        },
      ],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'onERC721Received',
      inputs: [
        {
          name: '',
          type: 'address',
          internalType: 'address',
        },
        {
          name: 'from',
          type: 'address',
          internalType: 'address',
        },
        {
          name: '',
          type: 'uint256',
          internalType: 'uint256',
        },
        {
          name: '',
          type: 'bytes',
          internalType: 'bytes',
        },
      ],
      outputs: [
        {
          name: '',
          type: 'bytes4',
          internalType: 'bytes4',
        },
      ],
      stateMutability: 'pure',
    },
    {
      type: 'function',
      name: 'owner',
      inputs: [],
      outputs: [
        {
          name: '',
          type: 'address',
          internalType: 'address',
        },
      ],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'ownerOf',
      inputs: [
        {
          name: 'tokenId',
          type: 'uint256',
          internalType: 'uint256',
        },
      ],
      outputs: [
        {
          name: '',
          type: 'address',
          internalType: 'address',
        },
      ],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'purchaseMarketItem',
      inputs: [
        {
          name: 'tokenId',
          type: 'uint256',
          internalType: 'uint256',
        },
      ],
      outputs: [],
      stateMutability: 'payable',
    },
    {
      type: 'function',
      name: 'renounceOwnership',
      inputs: [],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'safeTransferFrom',
      inputs: [
        {
          name: 'from',
          type: 'address',
          internalType: 'address',
        },
        {
          name: 'to',
          type: 'address',
          internalType: 'address',
        },
        {
          name: 'tokenId',
          type: 'uint256',
          internalType: 'uint256',
        },
      ],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'safeTransferFrom',
      inputs: [
        {
          name: 'from',
          type: 'address',
          internalType: 'address',
        },
        {
          name: 'to',
          type: 'address',
          internalType: 'address',
        },
        {
          name: 'tokenId',
          type: 'uint256',
          internalType: 'uint256',
        },
        {
          name: 'data',
          type: 'bytes',
          internalType: 'bytes',
        },
      ],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'setApprovalForAll',
      inputs: [
        {
          name: 'operator',
          type: 'address',
          internalType: 'address',
        },
        {
          name: 'approved',
          type: 'bool',
          internalType: 'bool',
        },
      ],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'supportsInterface',
      inputs: [
        {
          name: 'interfaceId',
          type: 'bytes4',
          internalType: 'bytes4',
        },
      ],
      outputs: [
        {
          name: '',
          type: 'bool',
          internalType: 'bool',
        },
      ],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'symbol',
      inputs: [],
      outputs: [
        {
          name: '',
          type: 'string',
          internalType: 'string',
        },
      ],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'tokenURI',
      inputs: [
        {
          name: 'tokenId',
          type: 'uint256',
          internalType: 'uint256',
        },
      ],
      outputs: [
        {
          name: '',
          type: 'string',
          internalType: 'string',
        },
      ],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'transferFrom',
      inputs: [
        {
          name: 'from',
          type: 'address',
          internalType: 'address',
        },
        {
          name: 'to',
          type: 'address',
          internalType: 'address',
        },
        {
          name: 'tokenId',
          type: 'uint256',
          internalType: 'uint256',
        },
      ],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'transferOwnership',
      inputs: [
        {
          name: 'newOwner',
          type: 'address',
          internalType: 'address',
        },
      ],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'withdraw',
      inputs: [],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'event',
      name: 'Approval',
      inputs: [
        {
          name: 'owner',
          type: 'address',
          indexed: true,
          internalType: 'address',
        },
        {
          name: 'approved',
          type: 'address',
          indexed: true,
          internalType: 'address',
        },
        {
          name: 'tokenId',
          type: 'uint256',
          indexed: true,
          internalType: 'uint256',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'ApprovalForAll',
      inputs: [
        {
          name: 'owner',
          type: 'address',
          indexed: true,
          internalType: 'address',
        },
        {
          name: 'operator',
          type: 'address',
          indexed: true,
          internalType: 'address',
        },
        {
          name: 'approved',
          type: 'bool',
          indexed: false,
          internalType: 'bool',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'BatchMetadataUpdate',
      inputs: [
        {
          name: '_fromTokenId',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
        {
          name: '_toTokenId',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'MarketItemCreated',
      inputs: [
        {
          name: 'tokenId',
          type: 'uint256',
          indexed: true,
          internalType: 'uint256',
        },
        {
          name: 'seller',
          type: 'address',
          indexed: false,
          internalType: 'address',
        },
        {
          name: 'owner',
          type: 'address',
          indexed: false,
          internalType: 'address',
        },
        {
          name: 'price',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
        {
          name: 'sold',
          type: 'bool',
          indexed: false,
          internalType: 'bool',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'MarketItemPurchased',
      inputs: [
        {
          name: 'tokenId',
          type: 'uint256',
          indexed: true,
          internalType: 'uint256',
        },
        {
          name: 'buyer',
          type: 'address',
          indexed: false,
          internalType: 'address',
        },
        {
          name: 'seller',
          type: 'address',
          indexed: false,
          internalType: 'address',
        },
        {
          name: 'price',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'MetadataUpdate',
      inputs: [
        {
          name: '_tokenId',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'OwnershipTransferred',
      inputs: [
        {
          name: 'previousOwner',
          type: 'address',
          indexed: true,
          internalType: 'address',
        },
        {
          name: 'newOwner',
          type: 'address',
          indexed: true,
          internalType: 'address',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'Transfer',
      inputs: [
        {
          name: 'from',
          type: 'address',
          indexed: true,
          internalType: 'address',
        },
        {
          name: 'to',
          type: 'address',
          indexed: true,
          internalType: 'address',
        },
        {
          name: 'tokenId',
          type: 'uint256',
          indexed: true,
          internalType: 'uint256',
        },
      ],
      anonymous: false,
    },
    {
      type: 'error',
      name: 'ERC721IncorrectOwner',
      inputs: [
        {
          name: 'sender',
          type: 'address',
          internalType: 'address',
        },
        {
          name: 'tokenId',
          type: 'uint256',
          internalType: 'uint256',
        },
        {
          name: 'owner',
          type: 'address',
          internalType: 'address',
        },
      ],
    },
    {
      type: 'error',
      name: 'ERC721InsufficientApproval',
      inputs: [
        {
          name: 'operator',
          type: 'address',
          internalType: 'address',
        },
        {
          name: 'tokenId',
          type: 'uint256',
          internalType: 'uint256',
        },
      ],
    },
    {
      type: 'error',
      name: 'ERC721InvalidApprover',
      inputs: [
        {
          name: 'approver',
          type: 'address',
          internalType: 'address',
        },
      ],
    },
    {
      type: 'error',
      name: 'ERC721InvalidOperator',
      inputs: [
        {
          name: 'operator',
          type: 'address',
          internalType: 'address',
        },
      ],
    },
    {
      type: 'error',
      name: 'ERC721InvalidOwner',
      inputs: [
        {
          name: 'owner',
          type: 'address',
          internalType: 'address',
        },
      ],
    },
    {
      type: 'error',
      name: 'ERC721InvalidReceiver',
      inputs: [
        {
          name: 'receiver',
          type: 'address',
          internalType: 'address',
        },
      ],
    },
    {
      type: 'error',
      name: 'ERC721InvalidSender',
      inputs: [
        {
          name: 'sender',
          type: 'address',
          internalType: 'address',
        },
      ],
    },
    {
      type: 'error',
      name: 'ERC721NonexistentToken',
      inputs: [
        {
          name: 'tokenId',
          type: 'uint256',
          internalType: 'uint256',
        },
      ],
    },
    {
      type: 'error',
      name: 'NFTMarketplace__IncorrectListingFee',
      inputs: [],
    },
    {
      type: 'error',
      name: 'NFTMarketplace__IncorrectPrice',
      inputs: [],
    },
    {
      type: 'error',
      name: 'NFTMarketplace__MarketItemAlreadyOwned',
      inputs: [],
    },
    {
      type: 'error',
      name: 'NFTMarketplace__MarketItemAlreadySold',
      inputs: [],
    },
    {
      type: 'error',
      name: 'NFTMarketplace__ReceivedFromZeroAddress',
      inputs: [],
    },
    {
      type: 'error',
      name: 'OwnableInvalidOwner',
      inputs: [
        {
          name: 'owner',
          type: 'address',
          internalType: 'address',
        },
      ],
    },
    {
      type: 'error',
      name: 'OwnableUnauthorizedAccount',
      inputs: [
        {
          name: 'account',
          type: 'address',
          internalType: 'address',
        },
      ],
    },
    {
      type: 'error',
      name: 'ReentrancyGuardReentrantCall',
      inputs: [],
    },
  ],
} as const
