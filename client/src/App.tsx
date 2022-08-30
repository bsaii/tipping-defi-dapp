/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react'
import { Card, StyledBody, StyledAction } from 'baseui/card'
import { Button } from 'baseui/button'
import { styled } from 'baseui'
import { FormControl } from 'baseui/form-control'
import { Input } from 'baseui/input'
import { Notification, KIND } from 'baseui/notification'
import { Spinner } from 'baseui/spinner'

import abi from './utils/BuyMeACoffee.json'
import { shortenAddress } from './utils/shortenAddress'
import { ethers } from 'ethers'

const Container = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  width: '100%',
})

interface InitialState {
  name: string
  message: string
}

const initialState: InitialState = {
  name: '',
  message: '',
}

interface Status {
  wallet: {
    isConnected: boolean
    message: string
    network: {
      kind: string
      message: string
    }
  }
  buyCoffee: {
    buying: boolean
    bought: boolean
  }
  memos: {
    isLoading: boolean
  }
}

const initialStatus: Status = {
  wallet: {
    isConnected: false,
    message: '',
    network: {
      kind: '',
      message: '',
    },
  },
  buyCoffee: {
    buying: false,
    bought: false,
  },
  memos: {
    isLoading: false,
  },
}

type Memos = any[]
type Account = string

let initialAccount: Account
let initialMemos: Memos

function App() {
  const [value, setValue] = useState(initialState)
  const [status, setStatus] = useState(initialStatus)
  const [currentAccount, setCurrentAccount] = useState(initialAccount)
  const [memos, setMemos] = useState(initialMemos)

  // Contract Address and ABI
  const contractAddress = '0x734E3e96aa2e45c308229f021202dc5f7Ea1cDd8'
  const contractABI = abi.abi

  const { ethereum } = window

  // Connect Wallet
  const connectWallet = async () => {
    try {
      if (!ethereum) {
        setStatus((prevState) => ({
          ...prevState,
          wallet: {
            ...prevState.wallet,
            message: "You don't have MetaMask installed.",
          },
        }))
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      })
      handleAccountsChanged(accounts)
    } catch (error: any) {
      if (error.code === 4001) {
        // EIP-1193 userRejectedRequest error
        // If this happens, the user rejected the connection request.
        setStatus((prevState) => ({
          ...prevState,
          wallet: {
            ...prevState.wallet,
            message: 'Please connect to MetaMask.',
          },
        }))
      } else {
        console.error(error)
        setStatus((prevState) => ({
          ...prevState,
          wallet: {
            ...prevState.wallet,
            message: 'Something went wrong.',
          },
        }))
      }
    }
  }

  // wallet is connected
  const isWalletConnected = async () => {
    try {
      const accounts = await ethereum.request({ method: 'eth_accounts' })
      handleAccountsChanged(accounts)
    } catch (error) {
      console.error(error)
    }
  }

  const handleAccountsChanged = (_accounts: string[]) => {
    if (_accounts.length === 0) {
      // MetaMask is locked or the user has not connected any accounts
      setStatus((prevState) => ({
        ...prevState,
        wallet: {
          ...prevState.wallet,
          isConnected: false,
          message: 'Please connect to MetaMask',
        },
      }))
    } else if (_accounts[0] !== currentAccount) {
      setCurrentAccount(_accounts[0])
      setStatus((prevState) => ({
        ...prevState,
        wallet: {
          ...prevState.wallet,
          isConnected: true,
          message: `Wallet is conneted to ${shortenAddress(_accounts[0])}`,
        },
      }))
    }
  }

  // chain (network)
  const getChainId = async () => {
    try {
      const chainId = await ethereum.request({ method: 'eth_chainId' })
      handleChainChanged(chainId)
    } catch (error) {
      console.error(error)
    }
  }

  const handleChainChanged = (_chainId: string) => {
    switch (_chainId) {
      case '0x1':
        setStatus((prevState) => ({
          ...prevState,
          wallet: {
            ...prevState.wallet,
            network: {
              kind: 'negative',
              message: "You're on the Ethereum Main Network (Mainnet)",
            },
          },
        }))
        break
      case '0x5':
        setStatus((prevState) => ({
          ...prevState,
          wallet: {
            ...prevState.wallet,
            network: {
              kind: 'positive',
              message: "You're on the Goerli Test Network",
            },
          },
        }))
        break

      default:
        setStatus((prevState) => ({
          ...prevState,
          wallet: {
            ...prevState.wallet,
            network: {
              kind: 'negative',
              message: "You're not on the Goerli Test Network",
            },
          },
        }))
        break
    }
  }

  // coffee purchase
  const buyCoffee = async () => {
    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        )
        setStatus((prevState) => ({
          ...prevState,
          buyCoffee: {
            ...prevState.buyCoffee,
            buying: true,
          },
        }))
        const coffeeTxn = await buyMeACoffee.buyCoffee(
          value.name ? value.name : 'Unknown',
          value.message ? value.message : 'Enjoy your coffee!',
          { value: ethers.utils.parseEther('0.001') }
        )

        await coffeeTxn.wait()

        setStatus((prevState) => ({
          ...prevState,
          buyCoffee: {
            ...prevState.buyCoffee,
            buying: false,
            bought: true,
          },
        }))

        // Clear the form fields.
        setValue(initialState)

        setTimeout(() => {
          setStatus((prevState) => ({
            ...prevState,
            buyCoffee: {
              ...prevState.buyCoffee,
              buying: false,
              bought: false,
            },
          }))
          window.location.reload()
        }, 3500)
      }
    } catch (error) {
      console.log(error)
      setStatus((prevState) => ({
        ...prevState,
        buyCoffee: {
          ...prevState.buyCoffee,
          buying: false,
          bought: false,
        },
      }))
    }
  }

  // get all the memos stored on-chain
  const getMemos = async () => {
    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, 'any')
        const signer = provider.getSigner()
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        )

        setStatus((prevState) => ({
          ...prevState,
          memos: {
            isLoading: true,
          },
        }))
        const _memos = await buyMeACoffee.getMemos()
        const sortMemos = [..._memos]
        sortMemos.sort((a: any, b: any) => b.timestamp - a.timestamp)
        setMemos(sortMemos)
        setStatus((prevState) => ({
          ...prevState,
          memos: {
            isLoading: false,
          },
        }))
      }
    } catch (error) {
      console.error(error)
    }
  }

  // Create an event handler function for when someone sends us a new memo.
  // const onNewMemo = (
  //   from: string,
  //   timestamp: number,
  //   name: string,
  //   message: string
  // ) => {
  //   console.log('Memo received: ', from, timestamp, name, message)
  //   setMemos([
  //     ...memos,
  //     {
  //       address: from,
  //       timestamp,
  //       message,
  //       name,
  //     },
  //   ])
  // }
  // Listen for new memo events.
  // if (ethereum) {
  //   const provider = new ethers.providers.Web3Provider(ethereum, 'any')
  //   const signer = provider.getSigner()
  //   const buyMeACoffee = new ethers.Contract(
  //     contractAddress,
  //     contractABI,
  //     signer
  //   )
  //   buyMeACoffee.on('newMemo', onNewMemo)
  //   buyMeACoffee.removeListener('newMemo', onNewMemo)
  // }

  // Listen for metamask events
  ethereum.on('accountsChanged', handleAccountsChanged)
  ethereum.on('chainChanged', handleChainChanged)
  // ethereum.removeListener('accountsChanged', handleAccountsChanged)
  // ethereum.removeListener('chainChanged', handleChainChanged)

  useEffect(() => {
    isWalletConnected()
    getChainId()
    getMemos()
  }, [])

  return (
    <Container>
      {/* connect wallet and info */}
      <Card
        title='Wallet'
        overrides={{
          Root: {
            style: { marginTop: '3.5rem', width: '400px' },
          },
          Title: {
            style: {},
          },
        }}
      >
        <StyledBody>
          <Notification
            overrides={{
              Body: { style: { width: 'auto' } },
            }}
          >
            {() => status.wallet.message}
          </Notification>
          <Notification
            overrides={{
              Body: { style: { width: 'auto' } },
            }}
            closeable
            kind={
              status.wallet.network.kind === 'positive'
                ? KIND.positive
                : KIND.negative
            }
          >
            {() => status.wallet.network.message}
          </Notification>
        </StyledBody>
        <StyledAction>
          <Button
            startEnhancer={() => (
              <img
                src='https://img.icons8.com/doodle/48/000000/wallet--v1.png'
                width={30}
                height={30}
              />
            )}
            overrides={{
              BaseButton: { style: { width: '100%' } },
            }}
            onClick={() => connectWallet()}
            disabled={status.wallet.isConnected}
          >
            Connect Wallet
          </Button>
        </StyledAction>
      </Card>
      {/* End connect wallet and info */}

      {/* Buy me a  coffee */}
      {status.wallet.isConnected && status.wallet.network.kind === 'positive' && (
        <Card
          title='Buy SAII A Coffee'
          overrides={{
            Root: {
              style: { marginTop: '1rem', width: '400px' },
            },
          }}
        >
          <StyledBody>
            <FormControl label='Name'>
              <Input
                id='name-input-id'
                value={value.name}
                onChange={(event) =>
                  setValue({ ...value, name: event.currentTarget.value })
                }
              />
            </FormControl>
            <FormControl label='Message' caption='Want to say hello...👋🏽'>
              <Input
                id='message-input-id'
                value={value.message}
                onChange={(event) =>
                  setValue({ ...value, message: event.currentTarget.value })
                }
              />
            </FormControl>
          </StyledBody>
          <StyledAction>
            <Button
              startEnhancer={() =>
                !status.buyCoffee.bought ? (
                  !status.buyCoffee.buying ? (
                    <img
                      src='https://img.icons8.com/fluency/48/000000/iced-coffee.png'
                      width={30}
                      height={30}
                    />
                  ) : (
                    <Spinner $size='20px' />
                  )
                ) : (
                  <img
                    src='https://img.icons8.com/emoji/48/000000/love-you-gesture-medium-dark-skin-tone.png'
                    width={30}
                    height={30}
                  />
                )
              }
              overrides={{
                BaseButton: { style: { width: '100%' } },
              }}
              onClick={buyCoffee}
            >
              {!status.buyCoffee.bought
                ? !status.buyCoffee.buying
                  ? 'Buy Coffee'
                  : 'Buying'
                : 'Thank you'}
            </Button>
          </StyledAction>
        </Card>
      )}

      {/* End Buy me a coffee */}

      {/* memos */}
      {status.wallet.isConnected && status.wallet.network.kind === 'positive' && (
        <Card
          title='Memos'
          overrides={{
            Root: {
              style: {
                marginTop: '1rem',
                width: '400px',
                height: '250px',
                overflow: 'auto',
              },
            },
          }}
        >
          <StyledBody>
            What other people are saying.
            <br />
            {!status.memos.isLoading ? (
              memos?.map((memo, index) => (
                <Card
                  title={memo.name}
                  overrides={{
                    Root: {
                      style: { marginTop: '0.25rem', marginBottom: '0.25rem' },
                    },
                  }}
                  key={index}
                >
                  <StyledBody>
                    {memo.message}
                    <hr />
                    Address: {shortenAddress(memo.from)}
                    <br />
                    At: {new Date(memo.timestamp * 1000).toUTCString()}
                  </StyledBody>
                </Card>
              ))
            ) : (
              <Container>
                <Spinner $size='50px' />
              </Container>
            )}
          </StyledBody>
        </Card>
      )}

      {/* End memos */}
    </Container>
  )
}

export default App
