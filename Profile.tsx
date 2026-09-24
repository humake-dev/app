import React, {useEffect, useRef, useState} from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {saveUserProfile, getBodyReference } from './src/database/profileDatabse';
import { useUser } from './UserContext';
import AsyncStorage from "@react-native-async-storage/async-storage";
// ============================================================
// Types
// ============================================================

type AgeGroup =
  | '10s'
  | '20s'
  | '30s'
  | '40s'
  | '50s'
  | '60s';

type Gender =
  | 'male'
  | 'female'
  | 'unknown';

type Step =
  | 'age'
  | 'gender'
  | 'height'
  | 'weight';


// ============================================================
// Wheel
// ============================================================

const ITEM_HEIGHT = 56;




// ============================================================
// Wheel Picker
// ============================================================

type WheelItem = {
  value: string;
  label: string;
};


function WheelPicker({
  data,
  value,
  onChange,
}: {
  data: WheelItem[];
  value: string;
  onChange: (value: string) => void;
}) {
  const listRef = useRef<FlatList<WheelItem>>(null);
  const [isReady, setIsReady] = useState(false);

  const selectedIndex = Math.max(
    0,
    data.findIndex(item => item.value === value),
  );

  // ----------------------------------------------------------
  // 현재 선택값 위치로 이동
  // ----------------------------------------------------------

  const scrollToSelected = () => {
    if (!listRef.current) {
      return;
    }

    listRef.current.scrollToIndex({
      index: selectedIndex,
      animated: false,
      viewPosition: 0.5,
    });
  };

  // ----------------------------------------------------------
  // FlatList가 실제로 렌더링된 후 선택값 복원
  // ----------------------------------------------------------

  useEffect(() => {
    if (!isReady) {
      return;
    }

    // 한 프레임 기다린 후 이동
    requestAnimationFrame(() => {
      scrollToSelected();
    });
  }, [selectedIndex, isReady]);

  // ----------------------------------------------------------
  // 스크롤 종료
  // ----------------------------------------------------------

  const handleScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const offset =
      event.nativeEvent.contentOffset.y;

    const index = Math.round(
      offset / ITEM_HEIGHT,
    );

    const safeIndex = Math.max(
      0,
      Math.min(index, data.length - 1),
    );

    const item = data[safeIndex];

    if (item) {
      onChange(item.value);
    }
  };

  // ----------------------------------------------------------
  // 렌더링
  // ----------------------------------------------------------

  return (
    <View
      style={styles.wheelContainer}
      onLayout={() => {
        setIsReady(true);
      }}
    >
      <View style={styles.wheelHighlight} />

      <FlatList
        ref={listRef}
        data={data}
        keyExtractor={item => item.value}

        showsVerticalScrollIndicator={false}

        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        bounces={false}

        onMomentumScrollEnd={
          handleScrollEnd
        }

        onScrollToIndexFailed={() => {
          // 아직 렌더링이 끝나지 않은 경우
          // 잠시 후 다시 시도
          setTimeout(() => {
            scrollToSelected();
          }, 100);
        }}

        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}

        contentContainerStyle={{
          paddingVertical: ITEM_HEIGHT * 2,
        }}

        renderItem={({item, index}) => {
          const selected =
            item.value === value;

          return (
            <View
              style={[
                styles.wheelItem,
                {
                  opacity: selected
                    ? 1
                    : index === selectedIndex - 1 ||
                      index === selectedIndex + 1
                    ? 0.45
                    : 0.18,
                },
              ]}
            >
              <Text
                style={[
                  styles.wheelText,
                  selected &&
                    styles.wheelTextSelected,
                ]}
              >
                {item.label}
              </Text>
            </View>
          );
        }}
      />
    </View>
  );
}

// ============================================================
// Age Step
// ============================================================
function AgeStep({
  ageGroup,
  onChange,
}: {
  ageGroup: AgeGroup;
  onChange: (value: AgeGroup) => void
}) {

  const data: WheelItem[] = [
    {
      value: '10s',
      label: '10대',
    },
    {
      value: '20s',
      label: '20대',
    },
    {
      value: '30s',
      label: '30대',
    },
    {
      value: '40s',
      label: '40대',
    },
    {
      value: '50s',
      label: '50대',
    },
    {
      value: '60s',
      label: '60대 이상',
    },
  ];

  const pickerValue =
    ageGroup === 'unknown'
      ? '30s'
      : ageGroup;

  return (
    <View style={styles.step}>

      <Text style={styles.title}>
        당신의 나이대를
        {'\n'}
        선택해주세요
      </Text>

      <Text style={styles.description}>
        신체 평균값을 계산하는 데 사용됩니다.
      </Text>

      <WheelPicker
        data={data}
        value={pickerValue}
        onChange={value =>
          onChange(value as AgeGroup)
        }
      />


      <Pressable
        style={[
          styles.notInputButton,
          ageGroup === null && styles.notInputButtonSelected, // null이면 선택된 스타일
        ]}
        onPress={() => onChange(null)}
      >
        <Text style={[
          styles.notInputText,
          ageGroup === null && styles.notInputTextSelected, // 텍스트 색상도 변경
        ]}>
          나이를 입력하지 않을게요
        </Text>
      </Pressable>

    </View>
  );
}


// ============================================================
// Gender Step
// ============================================================

function GenderStep({
  gender,
  onSelect,
  onSkip,
}: {
  gender: Gender | null;
  onSelect: (value: Gender) => void;
  onSkip: () => void;
}) {

  return (
    <View style={styles.step}>

      <Text style={styles.title}>
        당신의 성별은?
      </Text>

      <Text style={styles.description}>
        신체 평균값을 선택하는 데 사용됩니다.
      </Text>

      <View style={styles.genderGrid}>

        <GenderCard
          icon="human-male"
          title="남자"
          selected={gender === 'male'}
          onPress={() =>
            onSelect('male')
          }
        />

        <GenderCard
          icon="human-female"
          title="여자"
          selected={gender === 'female'}
          onPress={() =>
            onSelect('female')
          }
        />

      </View>

      <Pressable
        style={[
          styles.notInputButton,
          gender === 'unknown' && styles.notInputButtonSelected, // 선택된 스타일 추가
        ]}
        onPress={() => onSelect('unknown')}
      >
        <Text style={[
          styles.notInputText,
          gender === 'unknown' && styles.notInputTextSelected, // 텍스트 색상도 변경 가능
        ]}>
          성별을 입력하지 않을게요
        </Text>
      </Pressable>

    </View>
  );
}


// ============================================================
// Gender Card
// ============================================================

function GenderCard({
  icon,
  title,
  selected,
  onPress,
  full,
}: {
  icon: string;
  title: string;
  selected: boolean;
  onPress: () => void;
  full?: boolean;
}) {

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.genderCard,
        full && styles.genderCardFull,
        selected &&
          styles.genderCardSelected,
      ]}
    >

      <MaterialCommunityIcons
        name={icon}
        size={58}
        color={
          selected
            ? '#FFFFFF'
            : '#222222'
        }
      />

      <Text
        style={[
          styles.genderCardText,
          selected &&
            styles.genderCardTextSelected,
        ]}
      >
        {title}
      </Text>

    </Pressable>
  );
}


// ============================================================
// Height Step
// ============================================================

function HeightStep({
  height,
  average,
  onChange,
}: {
  height: number | null;
  average: number | null;
  onChange: (value: number | null) => void;
}) {

  const data: WheelItem[] = [];

  for (
    let i = 130;
    i <= 220;
    i++
  ) {
    data.push({
      value: String(i),
      label: `${i} cm`,
    });
  }

/*
  if (height === null) {
    return (
      <View style={styles.step}>

        <Text style={styles.title}>
          당신의 키(신장)를
          {'\n'}
          입력해주세요
        </Text>

        <Text style={styles.description}>
          나이대와 성별의 평균값을
          {'\n'}
          기본값으로 선택했습니다.
        </Text>


        <View style={styles.emptyValueBox}>

          <MaterialCommunityIcons
            name="human-male-height"
            size={48}
            color="#999999"
          />

          <Text style={styles.emptyValue}>
            미입력
          </Text>

        </View>


        <Pressable
          style={styles.referenceButton}
          onPress={() =>
            average !== null &&
            onChange(average)
          }
        >
          <Text style={styles.referenceButtonText}>
            평균값 {average} cm 사용
          </Text>
        </Pressable>

      </View>
    );
  }
*/

  return (
    <View style={styles.step}>

      <Text style={styles.title}>
        당신의 키(신장)를
        {'\n'}
        입력해주세요
      </Text>

      <Text style={styles.description}>
        휠을 움직여 키를 선택해주세요.
      </Text>


      <WheelPicker
        data={data}
        value={String(height)}
        onChange={value =>
          onChange(Number(value))
        }
      />


      <Pressable
        style={[
          styles.notInputButton,
          height === null && styles.notInputButtonSelected, // null이면 선택된 스타일
        ]}
        onPress={() => onChange(null)}
      >
        <Text style={[
          styles.notInputText,
          height === null && styles.notInputTextSelected, // 텍스트 색상도 변경
        ]}>
          키를 입력하지 않을게요
        </Text>
      </Pressable>

    </View>
  );
}


// ============================================================
// Weight Step
// ============================================================

function WeightStep({
  weight,
  average,
  onChange,
}: {
  weight: number | null;
  average: number | null;
  onChange: (value: number | null) => void;
}) {

  const data: WheelItem[] = [];

for (let i = 400; i <= 1299; i++) {
  const kg = i / 10;

  data.push({
    value: kg.toFixed(1),
    label: `${kg.toFixed(1)} kg`,
  });
}

/*
  if (weight === null) {

    return (
      <View style={styles.step}>

        <Text style={styles.title}>
          당신의 몸무게를
          {'\n'}
          입력해주세요
        </Text>

        <Text style={styles.description}>
          나이대와 성별의 평균값을
          {'\n'}
          기본값으로 선택했습니다.
        </Text>


        <View style={styles.emptyValueBox}>

          <MaterialCommunityIcons
            name="weight-kilogram"
            size={48}
            color="#999999"
          />

          <Text style={styles.emptyValue}>
            미입력
          </Text>

        </View>


        <Pressable
          style={styles.referenceButton}
          onPress={() =>
            average !== null &&
            onChange(average)
          }
        >
          <Text style={styles.referenceButtonText}>
            평균값 {average?.toFixed(1)} kg 사용
          </Text>
        </Pressable>

      </View>
    );
  }
*/

return (
  <View style={styles.step}>

    <Text style={styles.title}>
      당신의 몸무게를
      {'\n'}
      입력해주세요
    </Text>

    <Text style={styles.description}>
      휠을 움직여 몸무게를 선택해주세요.
    </Text>

<WheelPicker
  data={data}
  value={
    weight !== null
      ? weight.toFixed(1)
      : '70.0'
  }
  onChange={value =>
    onChange(Number(value))
  }
/>

      <Pressable
        style={[
          styles.notInputButton,
          weight === null && styles.notInputButtonSelected, // null이면 선택된 스타일
        ]}
        onPress={() => onChange(null)}
      >
        <Text style={[
          styles.notInputText,
          weight === null && styles.notInputTextSelected, // 텍스트 색상도 변경
        ]}>
          몸무게를 입력하지 않을게요
        </Text>
      </Pressable>


  </View>
);
}


// ============================================================
// Main
// ============================================================

function ProfileScreen({
  onComplete,
}: {
  onComplete: () => void;
}) {

  const [step, setStep] =
    useState<Step>('gender');

  const [ageGroup, setAgeGroup] =
    useState<AgeGroup>('30s');

  const [gender, setGender] =
    useState<Gender | null>(null);

  const [height, setHeight] =
    useState<number | null>(null);

  const [weight, setWeight] =
    useState<number | null>(null);

  const [averageHeight, setAverageHeight] =
    useState<number | null>(null);

  const [averageWeight, setAverageWeight] =
    useState<number | null>(null);

const {
  setHasCompletedStart,
  setUseGuest,
} = useUser();



  // ----------------------------------------------------------
  // 나이대 변경
  // ----------------------------------------------------------

  const handleAgeChange = (
    value: AgeGroup,
  ) => {

    setAgeGroup(value);

    // 나이대가 바뀌면 평균값도 다시 계산
    if (
      gender &&
      gender !== 'unknown'
    ) {

      getBodyReference(
        value,
        gender,
      ).then(reference => {

        if (!reference) {
          return;
        }

        setAverageHeight(
          reference.height,
        );

        setAverageWeight(
          reference.weight,
        );

        setHeight(
          reference.height,
        );

        setWeight(
          reference.weight,
        );

      });

    }
  };

  const handleAgeSkip = () => {
  setAgeGroup('unknown');

  setStep('height');
};


  // ----------------------------------------------------------
  // 성별 선택
  // ----------------------------------------------------------

const handleGenderSelect = (
  value: Gender,
) => {
  setGender(value);

  if (value === 'unknown') {
    setAverageHeight(null);
    setAverageWeight(null);

    setHeight(null);
    setWeight(null);
  } else {
    getBodyReference(
      ageGroup,
      value,
    ).then(reference => {
      if (!reference) {
        return;
      }

      setAverageHeight(
        reference.height,
      );

      setAverageWeight(
        reference.weight,
      );

      // 아직 키를 선택하지 않았을 때만 평균값 적용
      if (height === null) {
        setHeight(reference.height);
      }

      // 아직 몸무게를 선택하지 않았을 때만 평균값 적용
      if (weight === null) {
        setWeight(reference.weight);
      }
    });
  }
};


const handleGenderSkip = () => {
  setGender('unknown');

  setStep('age');
};



  // ----------------------------------------------------------
  // 다음
  // ----------------------------------------------------------

const next = () => {
  if (step === 'gender') {
    setStep('age');
    return;
  }

  if (step === 'age') {
    setStep('height');
    return;
  }

  if (step === 'height') {
    setStep('weight');
    return;
  }

  if (step === 'weight') {
    saveProfile();
  }
};

  // ----------------------------------------------------------
  // 
  // ----------------------------------------------------------

const back = () => {
  if (step === 'age') {
    setStep('gender');
    return;
  }

  if (step === 'height') {
    setStep('age');
    return;
  }

  if (step === 'weight') {
    setStep('height');
    return;
  }
};


  // ----------------------------------------------------------
  // 저장
  // ----------------------------------------------------------

const saveProfile = async () => {
  try {
    await saveUserProfile({
      ageGroup,
      gender: gender ?? 'unknown',
      height,
      weight,
    });

    console.log('Profile saved', {
      ageGroup,
      gender: gender ?? 'unknown',
      height,
      weight,
    });

    // TODO:
    // AsyncStorage에 hasCompletedStart 저장
    // App.tsx의 onComplete() 호출
    await AsyncStorage.setItem('hasCompletedStart', 'true');

    setHasCompletedStart(true);

  } catch (error) {
    console.error('Profile save failed:', error);
  }
};

  // ----------------------------------------------------------
  // Progress
  // ----------------------------------------------------------

  const stepNumber = {
    gender: 1,
    age: 2,
    height: 3,
    weight: 4,
  }[step];


  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------

  return (
    <SafeAreaView style={styles.container}>

      {/* Progress */}

      <View style={styles.progressArea}>

        <View style={styles.progressBackground}>

          <View
            style={[
              styles.progress,
              {
                width:
                  `${stepNumber * 25}%`,
              },
            ]}
          />

        </View>

        <Text style={styles.progressText}>
          {stepNumber} / 4
        </Text>

      </View>


      {/* Content */}

      <View style={styles.content}>

        {step === 'age' && (
          <AgeStep
            ageGroup={ageGroup}
            onChange={
              handleAgeChange
            }
          />
        )}


        {step === 'gender' && (
          <GenderStep
            gender={gender}
            onSelect={
              handleGenderSelect
            }
          />
        )}


        {step === 'height' && (
          <HeightStep
            height={height}
            average={
              averageHeight
            }
            onChange={setHeight}
          />
        )}


        {step === 'weight' && (
          <WeightStep
            weight={weight}
            average={
              averageWeight
            }
            onChange={setWeight}
          />
        )}

      </View>


      {/* Bottom */}

<View style={styles.bottom}>

  {step !== 'gender' ? (
    <Pressable
      style={styles.backButton}
      onPress={back}
    >
      <Text style={styles.backText}>
        이전
      </Text>
    </Pressable>
  ) : (
    <View style={styles.backSpace} />
  )}

  <Pressable
    style={styles.nextButton}
    onPress={next}
  >
    <Text style={styles.nextText}>
      {step === 'weight' ? '완료' : '다음'}
    </Text>

    <MaterialCommunityIcons
      name={
        step === 'weight'
          ? 'check'
          : 'arrow-right'
      }
      size={22}
      color="#FFFFFF"
    />
  </Pressable>

</View>
    </SafeAreaView>
  );
}


// ============================================================
// Styles
// ============================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },


  progressArea: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },


  progressBackground: {
    height: 5,
    borderRadius: 10,
    backgroundColor: '#ECECEC',
    overflow: 'hidden',
  },


  progress: {
    height: 5,
    borderRadius: 10,
    backgroundColor: '#111111',
  },


  progressText: {
    marginTop: 7,
    textAlign: 'right',
    fontSize: 12,
    color: '#999999',
  },


  content: {
    flex: 1,
    paddingHorizontal: 24,
  },


  step: {
    flex: 1,
    justifyContent: 'center',
  },


  title: {
    fontSize: 30,
    lineHeight: 40,
    fontWeight: '700',
    color: '#111111',
  },


  description: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 23,
    color: '#888888',
  },


  // ----------------------------------------------------------
  // Gender
  // ----------------------------------------------------------

  genderGrid: {
    marginTop: 42,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },


  genderCard: {
    width: '48%',
    height: 190,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
  },


  genderCardFull: {
    width: '100%',
    height: 120,
    flexDirection: 'row',
    gap: 15,
  },


  genderCardSelected: {
    backgroundColor: '#111111',
    borderColor: '#111111',
  },


  genderCardText: {
    marginTop: 14,
    fontSize: 19,
    fontWeight: '700',
    color: '#222222',
  },


  genderCardTextSelected: {
    color: '#FFFFFF',
  },


  // ----------------------------------------------------------
  // Wheel
  // ----------------------------------------------------------

  wheelContainer: {
    height: 280,
    marginTop: 38,
    position: 'relative',
    overflow: 'hidden',
  },


  wheelHighlight: {
    position: 'absolute',
    top: 112,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderRadius: 16,
    backgroundColor: '#F3F3F3',
    zIndex: 0,
  },


  wheelItem: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },


  wheelText: {
    fontSize: 22,
    color: '#555555',
  },


  wheelTextSelected: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111111',
  },


  // ----------------------------------------------------------
  // Empty
  // ----------------------------------------------------------

  emptyValueBox: {
    height: 160,
    marginTop: 45,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },


  emptyValue: {
    marginTop: 8,
    fontSize: 25,
    fontWeight: '700',
    color: '#999999',
  },


  referenceButton: {
    height: 54,
    marginTop: 16,
    borderRadius: 16,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },


  referenceButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },


  notInputButton: {
    height: 52,
    marginTop: 25,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },


  notInputText: {
    fontSize: 15,
    color: '#555555',
  },


  // ----------------------------------------------------------
  // Bottom
  // ----------------------------------------------------------

  bottom: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 24,
    paddingBottom: 18,
  },


  backSpace: {
    flex: 1,
  },


  backButton: {
    flex: 1,
    height: 56,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    alignItems: 'center',
    justifyContent: 'center',
  },


  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },


  nextButton: {
    flex: 2,
    height: 56,
    borderRadius: 17,
    backgroundColor: '#111111',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },


  nextText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  notInputButton: {
    // 기존 버튼 스타일 (예: 흰색 배경, 검은색 테두리)
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    marginTop: 16,
  },
  notInputButtonSelected: {
    backgroundColor: '#222222', // 검은색 배경 (반전)
    borderColor: '#222222',
  },
  notInputText: {
    color: '#222222',
    fontSize: 14,
    fontWeight: '500',
  },
  notInputTextSelected: {
    color: '#FFFFFF', // 흰색 텍스트 (반전)
  },

});


export default ProfileScreen;